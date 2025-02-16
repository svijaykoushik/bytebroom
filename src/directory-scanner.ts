import { DirectoryTraverser } from './directory-traverser';
import { Utils } from './utils';
import { EventEmitter } from 'events';

export class DirectoryScanner extends EventEmitter {
  constructor(private directoryTraverser: DirectoryTraverser) {
    super();
    this.directoryTraverser.on('fileProcessed', (dir: string) =>
      this.emit<string>('directoryProcessed', dir),
    );
  }

  public async scan(directories: string[]): Promise<Map<number, string[]>> {
    const counts = await Promise.all(directories.map(async (directory) => {
      return await this.directoryTraverser.countFiles(directory);
    }));
    const totalFiles = counts.reduce((acc, curr) => acc + curr, 0);
    this.emit<number>('totalFilesAvailable', totalFiles);

    const sizeMaps: Map<number, string[]>[] = await Promise.all(directories.map(async (directory) => {
      return await this.directoryTraverser.traverse(directory);
    }));

    this.emit<void>('scanComplete');

    return Utils.mergeMaps<number, string>(...sizeMaps);
  }
}