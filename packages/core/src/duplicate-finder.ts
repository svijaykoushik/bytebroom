import { DuplicateDetector } from './duplicate-detector';
import { EventEmitter } from 'events';

export class DuplicateFinder extends EventEmitter {
  constructor(private duplicateDetector: DuplicateDetector) {
    super();
    this.duplicateDetector.on('fileScanned', (file: string) =>
      this.emit<string>('fileScanned', file),
    );
  }

  public async findDuplicates(sizeMap: Map<number, string[]>): Promise<Map<string, string[]>> {
    const totalFilesToScan = this.countTotalFilesToScan(sizeMap);
    this.emit<number>('totalFilesToScan', totalFilesToScan);
    if (totalFilesToScan === 0) {

      this.emit<void>('findComplete');
      return new Map<string, string[]>();
    }
    const duplicates = await this.duplicateDetector.detectDuplicates(sizeMap);

    if (duplicates.size === 0) {

      this.emit<void>('findComplete');
      return new Map<string, string[]>();
    }

    this.emit<void>('findComplete');

    return duplicates;
  }


  private countTotalFilesToScan(sizeMap: Map<number, string[]>): number {
    let totalItems = 0;

    for (const value of sizeMap.values()) {
      totalItems += value.length;
    }

    return totalItems;
  }
}