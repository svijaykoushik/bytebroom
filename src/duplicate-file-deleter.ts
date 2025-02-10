import inquirer from 'inquirer';
import {EventEmitter} from "events";

interface DuplicateGroup {
    displayName: string;
    files: string[];
    hash: string;
    index: number;
}

interface PageState {
    selectedFiles: string[];
}

export class DuplicateFileDeleter extends EventEmitter {
    private groups: DuplicateGroup[] = [];
    private pageStates = new Map<number, PageState>();
    private currentPage = 0;
    private readonly PAGE_SIZE = 5;

    constructor(private inputMap: Map<string, string[]>) {
        super();
        this.groups = this.processGroups(inputMap);
    }

    public async run(): Promise<void> {
        while (true) {
            const pageGroups = this.getCurrentPageGroups();
            const currentState = this.pageStates.get(this.currentPage) || {selectedFiles: []};

            // File Selection
            const fileAnswers = await inquirer.prompt(
                this.createFilePrompt(pageGroups, currentState.selectedFiles)
            );

            // Update state
            this.pageStates.set(this.currentPage, {selectedFiles: fileAnswers.selectedFiles});

            // Navigation
            const navAnswers = await inquirer.prompt(
                this.createNavigationPrompt(
                    this.currentPage > 0,
                    this.currentPage < Math.ceil(this.groups.length / this.PAGE_SIZE) - 1
                )
            );

            // Handle navigation
            if (navAnswers.action === '→ Next Page') this.currentPage++;
            if (navAnswers.action === '← Previous Page') this.currentPage--;
            if (navAnswers.action === 'cancel') {
                console.log('Operation cancelled.');
                process.exit();
            }
            if (navAnswers.action === 'finish') break;
        }

        // Final deletion logic
        const allSelected = Array.from(this.pageStates.values()).flatMap(
            (state) => state.selectedFiles
        );

        await this.performDeletion(allSelected);
    }

    private processGroups(hashMap: Map<string, string[]>): DuplicateGroup[] {
        return Array.from(hashMap.entries()).map(([hash, files], index) => ({
            hash,
            files,
            index,
            displayName: this.generateDisplayName(files[0], files.length),
        }));
    }

    private generateDisplayName(file: string, count: number): string {
        return `${file} (${count} duplicates)`;
    }

    private getCurrentPageGroups(): DuplicateGroup[] {
        const start = this.currentPage * this.PAGE_SIZE;
        return this.groups.slice(start, start + this.PAGE_SIZE);
    }

    private formatGroupHeader(group: DuplicateGroup): string {
        return `${group.index + 1}. █▌ ${group.displayName}`;
    }

    private formatFileEntry(file: string, isLast: boolean): string {
        const prefix = isLast ? '└──' : '├──';
        return `  ${prefix} ${file}`;
    }

    private createFilePrompt(pageGroups: DuplicateGroup[], currentSelections: string[]): Record<string, any> {
        return {
            type: 'checkbox',
            name: 'selectedFiles',
            message: 'Select files to delete (Space to toggle, Enter to confirm)',
            choices: () => {
                const choices: Record<string, any> = [];

                pageGroups.forEach((group, groupIndex) => {
                    choices.push(new inquirer.Separator(this.formatGroupHeader(group)));

                    group.files.forEach((file, fileIndex) => {
                        choices.push({
                            name: this.formatFileEntry(file, fileIndex === group.files.length - 1),
                            value: file,
                            checked: currentSelections.includes(file),
                        });
                    });

                    if (groupIndex < pageGroups.length - 1) {
                        choices.push(new inquirer.Separator('-'.repeat(40)));
                    }
                });

                return choices;
            },
            validate: (selected: string[]) => this.validateSelection(selected, pageGroups),
        };
    }

    private validateSelection(selected: string[], pageGroups: DuplicateGroup[]): true | string {
        const errorMessages: string[] = [];

        pageGroups.forEach((group) => {
            const groupFiles = new Set(group.files);
            const selectedCount = selected.filter((f) => groupFiles.has(f)).length;

            if (selectedCount === group.files.length) {
                errorMessages.push(
                    `Cannot delete all files in group "${group.displayName}"`
                );
            }
        });

        return errorMessages.length > 0 ? errorMessages.join('\n') : true;
    }

    private createNavigationPrompt(hasPrevious: boolean, hasNext: boolean): Record<string, any> {
        const choices = [];

        if (hasPrevious) choices.push('← Previous Page');
        if (hasNext) choices.push('→ Next Page');
        choices.push(
            {name: '🚀 Finish and Trash', value: 'finish'},
            {name: '🚫 Cancel and Exit', value: 'cancel'}
        );

        return {
            type: 'list',
            name: 'action',
            message: 'Navigation',
            choices,
        };
    }

    private async performDeletion(selectedFiles: string[]): Promise<void> {
        // new line for delete progress
        process.stdout.write('\n');
        this.emit('totalSelectedFiles', selectedFiles.length);
        const trashModule = await import('trash');
        const promises = selectedFiles.map(async (file) => {
            await trashModule.default(file);
            this.emit('fileTrashed', file);
        })
        await Promise.all(promises);
        this.emit('allFilesTrashed');
    }
}