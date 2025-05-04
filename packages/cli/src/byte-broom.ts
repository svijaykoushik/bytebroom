// byte-broom.ts
import { DirectoryScanner, DuplicateFinder, DuplicateRemover } from '@bytebroom/core';

export class ByteBroom {

  constructor(
    private directoryScanner: DirectoryScanner,
    private duplicateFinder: DuplicateFinder,
    private duplicateRemover: DuplicateRemover,
  ) {
  }

  public async findDuplicates(directories: string[]): Promise<void> {
    // 1. Scan directories to build a size map
    const combinedSizeMap = await this.directoryScanner.scan(directories);

    if (combinedSizeMap.size === 0) {
      return;
    }

    // 2. Find duplicates based on the size map
    const duplicates = await this.duplicateFinder.findDuplicates(combinedSizeMap);

    if (duplicates.size === 0) {
      return;
    }

    // 3. Remove duplicates
    await this.duplicateRemover.removeDuplicates(duplicates);
  }
}
