// byte-broom.ts
import {DirectoryTraverser} from './directory-traverser';
import {DuplicateDetector} from './duplicate-detector';
import {TaskQueueManager} from './worker-manager';
import {FileOperations} from './file-operations';
import {ProgressDisplay} from './progress-display';
import path from 'path';
import {DuplicateFileDeleter} from "./duplicate-file-deleter";
import {Utils} from "./utils";

interface Options {
  knownSystemDirs: string[];
  filter: string[];
  exclude: string[];
}

export class ByteBroom {
  private readonly knownSystemDirs: Set<string>;
  private directoryTraverser: DirectoryTraverser;
  private duplicateDetector: DuplicateDetector;
  private traverseProgressDisplay: ProgressDisplay;
  private scanProgressDisplay: ProgressDisplay;
  private deleteProgressDisplay: ProgressDisplay;

  constructor(
      options: Options,
      private taskQueueManager: TaskQueueManager,
      fileOperations: FileOperations,
  ) {
    this.knownSystemDirs = new Set(options.knownSystemDirs.map((dir) => path.resolve(dir)));
    this.directoryTraverser = new DirectoryTraverser(this.knownSystemDirs, fileOperations, options.filter, options.exclude);
    this.duplicateDetector = new DuplicateDetector(this.taskQueueManager);
    this.traverseProgressDisplay = new ProgressDisplay();
    this.scanProgressDisplay = new ProgressDisplay();
    this.deleteProgressDisplay = new ProgressDisplay();

    this.directoryTraverser.on('fileProcessed', (dir) =>
        this.traverseProgressDisplay.update(`Searching - ${dir}`),
    );
    this.duplicateDetector.on('fileScanned', (file: string) =>
        this.scanProgressDisplay.update(`Scanning - ${file}`),
    );
  }

  public async findDuplicates(directories: string[], verbose: boolean): Promise<void> {
    let totalFiles = 0;
    for (const directory of directories) {
      totalFiles += await this.directoryTraverser.countFiles(directory);
    }
    this.traverseProgressDisplay.setTotal(totalFiles);

    const sizeMaps: Map<number, string[]>[] = [];
    for (const directory of directories) {
      sizeMaps.push(await this.directoryTraverser.traverse(directory));
    }
    this.traverseProgressDisplay.finish();

    const combinedSizeMap = Utils.mergeMaps<number, string>(...sizeMaps);

    const totalFilesToScan = this.countTotalFilesToScan(combinedSizeMap);
    if (totalFilesToScan === 0) {
      this.printNoDuplicates()
      process.exit(0);
    }
    this.scanProgressDisplay.setTotal(totalFilesToScan);
    const duplicates = await this.duplicateDetector.detectDuplicates(combinedSizeMap);
    this.scanProgressDisplay.finish();

    if (duplicates.size === 0) {
      this.printNoDuplicates();
      process.exit(0);
    }

    const deleter = new DuplicateFileDeleter(duplicates);
    await deleter.run();

    deleter.on('totalSelectedFiles', (total: number) => {
      this.deleteProgressDisplay.setTotal(total);
    });

    deleter.on('fileTrashed', (deletedFile: string) => {
      this.deleteProgressDisplay.update(`Trashed - ${deletedFile}`);
    });

    deleter.on('allFilesTrashed', () => {
      this.deleteProgressDisplay.finish();
    })
    // ResultsPrinter.print(duplicates, verbose);
  }

  private countTotalFilesToScan(sizeMap: Map<number, string[]>): number {
    let totalItems = 0;

    for (const value of sizeMap.values()) {
      totalItems += value.length;
    }

    return totalItems;
  }

  private printNoDuplicates() {
    process.stdout.write('No Duplicates Found');
    process.stdout.write('\n');
  }
}
