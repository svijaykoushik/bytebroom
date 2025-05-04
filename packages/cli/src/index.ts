
import { ByteBroom } from './byte-broom';
import * as os from 'os';
import { existsSync, statSync } from 'fs';
import { ProgressDisplay } from './progress-display';
import { ArgumentParser } from './argument-parser';
import { ErrorHandler, WorkerManager, TaskQueueManager, FileOperations, DuplicateFileDeleterFactory, DirectoryTraverser, DirectoryScanner, DuplicateDetector, DuplicateFinder, DuplicateRemover } from '@bytebroom/core';

interface Options {
  knownSystemDirs: string[];
  filter: string[];
  exclude: string[];
}

(async () => {
  const { directories, filter, exclude } = ArgumentParser.parse();
  const invalidDirs = directories.filter((dir) => !existsSync(dir) || !statSync(dir).isDirectory());

  if (invalidDirs.length > 0) {
    const error = new Error();
    error.message = `Error: The following directories do not exist or are not valid directories: \n${invalidDirs.join('\n')}`;
    ErrorHandler.handle(error);
    process.exit(1);
  }
  try {
    const options: Options = {
      knownSystemDirs: ['/System', '/Windows', '/usr'],
      filter: filter || [],
      exclude: exclude || [],
    };
    const maxWorkers = os.cpus().length;
    const workerManager = new WorkerManager(maxWorkers);
    const taskQueueManager = new TaskQueueManager(workerManager);
    const fileOperations = new FileOperations();
    const duplicateDeleterFactory = new DuplicateFileDeleterFactory();
    const directoryTraverser = new DirectoryTraverser(new Set([...options.knownSystemDirs]), fileOperations, options.filter, options.exclude);
    const directoryScanner = new DirectoryScanner(directoryTraverser);
    const duplicateDetector = new DuplicateDetector(taskQueueManager);
    const duplicateFinder = new DuplicateFinder(duplicateDetector);
    const duplicateRemover = new DuplicateRemover(duplicateDeleterFactory);

    const traverseProgressDisplay: ProgressDisplay = new ProgressDisplay();
    const scanProgressDisplay: ProgressDisplay = new ProgressDisplay();

    directoryScanner.on('totalFilesAvailable', (totalFiles: number) => {
      traverseProgressDisplay.setTotal(totalFiles);
    });

    duplicateFinder.on('totalFilesToScan', (totalFiles: number) => {
      scanProgressDisplay.setTotal(totalFiles);
    });

    directoryScanner.on('directoryProcessed', (dir) =>
      traverseProgressDisplay.update(`Searching - ${dir}`),
    );

    duplicateFinder.on('fileScanned', (file: string) =>
      scanProgressDisplay.update(`Scanning - ${file}`),
    );

    directoryScanner.on('scanComplete', () => {
      traverseProgressDisplay.finish();
    });

    duplicateFinder.on('findComplete', () => {
      scanProgressDisplay.finish();
    });

    const byteBroom = new ByteBroom(
      directoryScanner,
      duplicateFinder,
      duplicateRemover,
    );
    await byteBroom.findDuplicates(directories);
  } catch (error) {
    ErrorHandler.handle(error);
    process.exit(1);
  }
})();
