// byte-broom.ts
import {DirectoryTraverser} from './directory-traverser';
import {DuplicateDetector} from './duplicate-detector';
import {TaskQueueManager} from './worker-manager';
import {FileOperations} from './file-operations';
import {ProgressDisplay} from './progress-display';
import {ResultsPrinter} from './results-printer';
import path from "path";

interface Options {
    knownSystemDirs: string[];
}

export class ByteBroom {
    private readonly knownSystemDirs: Set<string>;
    private directoryTraverser: DirectoryTraverser;
    private duplicateDetector: DuplicateDetector;
    private traverseProgressDisplay: ProgressDisplay;
    private scanProgressDisplay: ProgressDisplay;

    constructor(
        options: Options,
        private taskQueueManager: TaskQueueManager,
        fileOperations: FileOperations
    ) {
        this.knownSystemDirs = new Set(options.knownSystemDirs.map(dir => path.resolve(dir)));
        this.directoryTraverser = new DirectoryTraverser(this.knownSystemDirs, fileOperations);
        this.duplicateDetector = new DuplicateDetector(taskQueueManager);
        this.traverseProgressDisplay = new ProgressDisplay();
        this.scanProgressDisplay = new ProgressDisplay();

        this.directoryTraverser.on('fileProcessed', (dir) => this.traverseProgressDisplay.update(`Searching - ${dir}`));
        this.duplicateDetector.on('fileScanned', (file: string) => this.scanProgressDisplay.update(`Scanning - ${file}`));
    }

    public async findDuplicates(directory: string, verbose: boolean): Promise<void> {
        const totalFiles = await this.directoryTraverser.countFiles(directory);
        this.traverseProgressDisplay.setTotal(totalFiles);

        const sizeMap = await this.directoryTraverser.traverse(directory);
        this.traverseProgressDisplay.finish();
        const totalFilesToScan = this.countTotalFilesToScan(sizeMap);
        this.scanProgressDisplay.setTotal(totalFilesToScan);
        const duplicates = await this.duplicateDetector.detectDuplicates(sizeMap);

        ResultsPrinter.print(duplicates, verbose);
    }

    private countTotalFilesToScan(sizeMap: Map<number, string[]>): number {
        let totalItems = 0;

        for (const value of sizeMap.values()) {
            totalItems += value.length;
        }

        return totalItems;
    }
}