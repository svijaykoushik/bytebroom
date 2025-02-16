import { DuplicateFileDeleterFactory } from './duplicate-file-deleter-factory';
import { EventEmitter } from 'events';

export class DuplicateRemover extends EventEmitter {
  constructor(private duplicateFileDeleterFactory: DuplicateFileDeleterFactory) {
    super();
  }

  public async removeDuplicates(duplicates: Map<string, string[]>): Promise<void> {
    const deleter = this.duplicateFileDeleterFactory.createDuplicateFileDeleter(duplicates);
    await deleter.run();
  }
}