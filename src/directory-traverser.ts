// directory-traverser.ts
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { FileOperations } from './file-operations';
import { ErrorHandler } from './error-handler';

export class DirectoryTraverser extends EventEmitter {
    constructor(
        private knownSystemDirs: Set<string>,
        private fileOperations: FileOperations,
        private filterFileExtensions: string[] = [],
        private excludeExtensions: string[] = []
    ) {
        super();
        this.filterFileExtensions = this.filterFileExtensions.map(ext => ext.toLowerCase());
        this.excludeExtensions = this.excludeExtensions.map(ext => ext.toLowerCase());
    }

    public async countFiles(directory: string): Promise<number> {
        try {
            const entries = await fs.promises.readdir(directory, {withFileTypes: true});
            let count = 0;
            for (const entry of entries) {
                const fullPath = path.join(directory, entry.name);
                if (entry.isDirectory()) {
                    count += await this.countFiles(fullPath);
                } else if (entry.isFile() && this.isAllowedExtension(entry.name)) {
                    count++;
                }
            }
            return count;
        } catch (error) {
            ErrorHandler.handle(error, `Error counting files in ${directory}`);
            return 0;
        }
    }

    public async traverse(rootDir: string): Promise<Map<number, string[]>> {
        const sizeMap = new Map<number, string[]>();
        await this.traverseDirectory(rootDir, sizeMap);
        return sizeMap;
    }

    private async traverseDirectory(
        directory: string,
        sizeMap: Map<number, string[]>,
    ): Promise<void> {
        if (this.knownSystemDirs.has(directory)) return;

        try {
            const entries = await fs.promises.readdir(directory, {withFileTypes: true});
            for (const entry of entries) {
                const fullPath = path.join(directory, entry.name);
                if (entry.isDirectory()) {
                    await this.traverseDirectory(fullPath, sizeMap);
                } else if (entry.isFile() && this.isAllowedExtension(entry.name)) {
                    try {
                        const stats = await this.fileOperations.getFileStats(fullPath);
                        this.emit('fileProcessed', directory);
                        if (stats && stats.isFile()) {
                            const size = stats.size;
                            const files = sizeMap.get(size) || [];
                            files.push(fullPath);
                            sizeMap.set(size, files);
                        }
                    } catch (e) {
                        ErrorHandler.handle(e, `Error accessing file ${fullPath}`);
                    }
                }
            }
        } catch (error) {
            ErrorHandler.handle(error, `Error traversing directory ${directory}`);
        }
    }

    private isAllowedExtension(fileName: string): boolean {
        const ext = path.extname(fileName).toLowerCase().replace('.', ''); // Extract extension without dot

        // If exclude list contains the extension, reject it
        if (this.excludeExtensions.includes(ext)) {
            return false;
        }

        // If filter list is empty, allow all files
        if (this.filterFileExtensions.length === 0) {
            return true;
        }

        // If filter list is present, only allow those extensions
        return this.filterFileExtensions.includes(ext);
    }
}
