import { DuplicateFileDeleter } from './duplicate-file-deleter';

export class DuplicateFileDeleterFactory {

  public createDuplicateFileDeleter(duplicatesMap: Map<string, string[]>): DuplicateFileDeleter {
    return new DuplicateFileDeleter(duplicatesMap);
  }
}