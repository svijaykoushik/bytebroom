import { DuplicateFileDeleterFactory } from '../src/duplicate-file-deleter-factory';
import { DuplicateFileDeleter } from '../src/duplicate-file-deleter';

describe('DuplicateFileDeleterFactory', () => {
  let duplicateFileDeleterFactory: DuplicateFileDeleterFactory;
  let expect: Chai.ExpectStatic;
  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });
  beforeEach(() => {
    duplicateFileDeleterFactory = new DuplicateFileDeleterFactory();
  });

  it('should create a DuplicateFileDeleter instance', () => {
    const duplicates = new Map<string, string[]>();
    const duplicateFileDeleter = duplicateFileDeleterFactory.createDuplicateFileDeleter(duplicates);
    expect(duplicateFileDeleter).to.be.instanceOf(DuplicateFileDeleter);
  });
});