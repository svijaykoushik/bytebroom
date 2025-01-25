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
    private knownSystemDirs: Set<string>;
    private directoryTraverser: DirectoryTraverser;
    private duplicateDetector: DuplicateDetector;
    private progressDisplay: ProgressDisplay;

    constructor(
        options: Options,
        private taskQueueManager: TaskQueueManager,
        fileOperations: FileOperations
    ) {
        this.knownSystemDirs = new Set(options.knownSystemDirs.map(dir => path.resolve(dir)));
        this.directoryTraverser = new DirectoryTraverser(this.knownSystemDirs, fileOperations);
        this.duplicateDetector = new DuplicateDetector(taskQueueManager);
        this.progressDisplay = new ProgressDisplay();

        this.directoryTraverser.on('fileProcessed', (dir) => this.progressDisplay.update(dir));
    }

    public async findDuplicates(directory: string, verbose: boolean): Promise<void> {
        const totalFiles = await this.directoryTraverser.countFiles(directory);
        this.progressDisplay.setTotal(totalFiles);

        const sizeMap = await this.directoryTraverser.traverse(directory);
        const duplicates = await this.duplicateDetector.detectDuplicates(sizeMap);

        ResultsPrinter.print(duplicates, verbose);
    }
}