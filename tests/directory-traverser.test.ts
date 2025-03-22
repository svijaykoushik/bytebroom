import { FileOperations } from '../src/file-operations';
import * as sinon from 'sinon';
import { DirectoryTraverser } from '../src/directory-traverser';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorHandler } from '../src/error-handler';

describe('Directory Traverser', () => {
  let knownSystemDirs: Set<string> = new Set();
  let fileOperationsStub: sinon.SinonStubbedInstance<FileOperations>;
  let filterFileExtensions: string[] = [];
  let excludeExtensions: string[] = [];
  let directoryTraverser: DirectoryTraverser;
  let expect: Chai.ExpectStatic;
  let readdirStub: sinon.SinonStub;
  let errorHandlerStub: sinon.SinonStub;

  before(async () => {
    const chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
    expect = chai.expect;
  });

  beforeEach(() => {
    knownSystemDirs = new Set(['system32', 'Program Files', 'var', 'usr']);
    fileOperationsStub = sinon.createStubInstance(FileOperations);
    filterFileExtensions = [];
    excludeExtensions = ['dll'];
    directoryTraverser = new DirectoryTraverser(
      knownSystemDirs,
      fileOperationsStub,
      filterFileExtensions,
      excludeExtensions,
    );
    readdirStub = sinon.stub(fs.promises, 'readdir');
    errorHandlerStub = sinon.stub(ErrorHandler, 'handle');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Instantiation', () => {
    it('should be instance of DirectoryTraverser', () => {
      expect(directoryTraverser).to.be.instanceof(DirectoryTraverser);
    });
  });
  describe('Error handling', async () => {
    it('should call ErrorHandler.handle when an error occurs while reading a directory', async () => {
      const directory = 'testDirectory';

      // Simulate an error when trying to read the directory
      const errorMessage = `Error reading directory: ${directory}`;
      readdirStub.withArgs(directory, { withFileTypes: true }).rejects(new Error(errorMessage));

      // Call the traverse function
      const result = await directoryTraverser.traverse(directory);

      // Ensure the result is an empty map because the error occurred
      expect(result.size).to.equal(0);

      // Verify that ErrorHandler.handle was called with the correct error message
      sinon.assert.calledOnce(errorHandlerStub);
    });
  });
  describe('Count Files', () => {
    it('should provide correct count', async () => {

      const directory = 'testDirectory';

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file2.txt', isDirectory: () => false, isFile: () => true },
      ]);

      const count = await directoryTraverser.countFiles(directory);

      expect(count).to.equal(2);
    });

    it('should return 0 for an empty directory', async () => {
      const directory = 'emptyDir';

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([]);

      const count = await directoryTraverser.countFiles(directory);

      expect(count).to.equal(0);
    });

    it('should provide 0 as count when permission is denied', async () => {
      const directory = 'protectedDirectory';

      readdirStub.withArgs(directory, { withFileTypes: true }).rejects(new Error('EACCESS: Permission denied'));
      const count = await directoryTraverser.countFiles(directory);
      expect(count).to.equal(0);
    });

    it('should count files correctly when the root directory contains only subdirectories', async () => {
      const rootDir = 'testDirectory';
      const subDir1 = path.join(rootDir, 'subDir1');
      const subDir2 = path.join(rootDir, 'subDir2');

      // Root directory contains only subdirectories (no files)
      readdirStub.withArgs(rootDir, { withFileTypes: true }).resolves([
        { name: 'subDir1', isDirectory: () => true, isFile: () => false },
        { name: 'subDir2', isDirectory: () => true, isFile: () => false },
      ]);

      // First subdirectory contains files
      readdirStub.withArgs(subDir1, { withFileTypes: true }).resolves([
        { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file2.txt', isDirectory: () => false, isFile: () => true },
      ]);

      // Second subdirectory contains files
      readdirStub.withArgs(subDir2, { withFileTypes: true }).resolves([
        { name: 'file3.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file4.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file5.txt', isDirectory: () => false, isFile: () => true },
      ]);

      const count = await directoryTraverser.countFiles(rootDir);

      expect(count).to.equal(5); // 2 files in subDir1 + 3 files in subDir2
    });

    it('should count other directories when last does not have permission', async () => {
      const directory = 'testDirectory';
      const subDirectory = path.join(directory, 'subDirectory');
      const protectedDirectory = path.join(directory, 'protectedDirectory');

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'subDirectory', isDirectory: () => true, isFile: () => false },
        { name: 'protectedDirectory', isDirectory: () => true, isFile: () => false },
      ]);

      readdirStub.withArgs(subDirectory, { withFileTypes: true }).resolves([
        { name: 'file1.text', isDirectory: () => false, isFile: () => true },
        { name: 'file2.text', isDirectory: () => false, isFile: () => true },
      ]);

      readdirStub.withArgs(protectedDirectory, { withFileTypes: true }).rejects(new Error('EACCESS: Permission denied'));

      const count = await directoryTraverser.countFiles(directory);
      sinon.assert.calledOnce(errorHandlerStub);
      expect(count).to.equal(2);
    });

    it('should count other directories when first does not have permission', async () => {
      const directory = 'testDirectory';
      const subDirectory = path.join(directory, 'subDirectory');
      const protectedDirectory = path.join(directory, 'protectedDirectory');

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'protectedDirectory', isDirectory: () => true, isFile: () => false },
        { name: 'subDirectory', isDirectory: () => true, isFile: () => false },
      ]);

      readdirStub.withArgs(subDirectory, { withFileTypes: true }).rejects(new Error('EACCESS: Permission denied'));
      readdirStub.withArgs(protectedDirectory, { withFileTypes: true }).resolves([
        { name: 'file1.text', isDirectory: () => false, isFile: () => true },
        { name: 'file2.text', isDirectory: () => false, isFile: () => true },
      ]);

      const count = await directoryTraverser.countFiles(directory);

      sinon.assert.calledOnce(errorHandlerStub);
      expect(count).to.equal(2);
    });

    it('should skip known system directories', async () => {
      const directory = 'var';

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([]);

      const count = await directoryTraverser.countFiles(directory);

      expect(count).to.equal(0);
    });

    it('should skip excluded extensions', async () => {
      const directory = 'testDirectory';

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file2.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file3.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file4.dll', isDirectory: () => false, isFile: () => true },
      ]);

      const count = await directoryTraverser.countFiles(directory);

      expect(count).to.equal(3);
    });
  });

  describe('Traverse Directory', () => {
    it('should give size Map with 1 item', async () => {
      const directory = 'testDirectory';
      const fileName = 'file1.txt';
      const fullPath = path.join(directory, fileName);
      const mockMap = new Map<number, string[]>([[200, ['file1.txt']]]);
      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
      ]);

      fileOperationsStub.getFileStats.withArgs(fullPath).resolves({
        isFile: () => true,
        size: 200,
        isDirectory: () => false,

      } as any);

      const result: Map<number, string[]> = await directoryTraverser.traverse(directory);

      expect(result.size).to.equal(mockMap.size);

      expect(result.get(200)).to.deep.equal([fullPath]);
    });

    it('should skip excluded extensions', async () => {
      const directory = 'testDirectory';

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file4.dll', isDirectory: () => false, isFile: () => true },
      ]);

      fileOperationsStub.getFileStats.withArgs(path.join(directory, 'file1.txt')).resolves({
        isFile: () => true,
        size: 200,
        isDirectory: () => false,
      } as any);
      fileOperationsStub.getFileStats.withArgs(path.join(directory, 'file4.dll')).resolves({
        isFile: () => true,
        size: 200,
        isDirectory: () => false,
      } as any);

      const result: Map<number, string[]> = await directoryTraverser.traverse(directory);

      expect(result.size).to.equal(1);
    });

    it('should correctly group files with equal size', async () => {
      const directory = 'testDirectory';

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file4.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file3.txt', isDirectory: () => false, isFile: () => true },
      ]);

      const size1 = 200;
      const size2 = 300;

      fileOperationsStub.getFileStats.withArgs(path.join(directory, 'file1.txt')).resolves({
        isFile: () => true,
        size: size1,
        isDirectory: () => false,
      } as any);
      fileOperationsStub.getFileStats.withArgs(path.join(directory, 'file4.txt')).resolves({
        isFile: () => true,
        size: size1,
        isDirectory: () => false,
      } as any);
      fileOperationsStub.getFileStats.withArgs(path.join(directory, 'file3.txt')).resolves({
        isFile: () => true,
        size: size2,
        isDirectory: () => false,
      } as any);

      const result: Map<number, string[]> = await directoryTraverser.traverse(directory);

      expect(result.size).to.equal(2);
      expect(result.get(size1)?.length).to.equal(2);
      expect(result.get(size2)?.length).to.equal(1);
    });

    it('should correctly group files with equal size despite having different extensions', async () => {
      const directory = 'testDirectory';

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file4.md', isDirectory: () => false, isFile: () => true },
        { name: 'file3.txt', isDirectory: () => false, isFile: () => true },
      ]);

      const size1 = 200;
      const size2 = 300;

      fileOperationsStub.getFileStats.withArgs(path.join(directory, 'file1.txt')).resolves({
        isFile: () => true,
        size: size1,
        isDirectory: () => false,
      } as any);
      fileOperationsStub.getFileStats.withArgs(path.join(directory, 'file4.md')).resolves({
        isFile: () => true,
        size: size1,
        isDirectory: () => false,
      } as any);
      fileOperationsStub.getFileStats.withArgs(path.join(directory, 'file3.txt')).resolves({
        isFile: () => true,
        size: size2,
        isDirectory: () => false,
      } as any);

      const result: Map<number, string[]> = await directoryTraverser.traverse(directory);

      expect(result.size).to.equal(2);
      expect(result.get(size1)?.length).to.equal(2);
      expect(result.get(size2)?.length).to.equal(1);
    });

    it('should correctly traverse and aggregate files with equal sizes acrros subdirectories', async () => {
      const directory = 'testDirectory';
      const subDir1 = path.join(directory, 'subDirectory1');
      const subDir2 = path.join(directory, 'subDirectory2');

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'subDirectory1', isDirectory: () => true, isFile: () => false },
        { name: 'subDirectory2', isDirectory: () => true, isFile: () => false },
      ]);

      readdirStub.withArgs(subDir1, { withFileTypes: true }).resolves([
        { name: 'file1.text', isDirectory: () => false, isFile: () => true },
        { name: 'file2.text', isDirectory: () => false, isFile: () => true },
      ]);
      readdirStub.withArgs(subDir2, { withFileTypes: true }).resolves([
        { name: 'file3.text', isDirectory: () => false, isFile: () => true },
        { name: 'file4.text', isDirectory: () => false, isFile: () => true },
      ]);

      const size1 = 200;
      const size2 = 300;

      fileOperationsStub.getFileStats.withArgs(path.join(subDir1, 'file1.text')).resolves({
        isFile: () => true,
        size: size1,
        isDirectory: () => false,
      } as any);
      fileOperationsStub.getFileStats.withArgs(path.join(subDir1, 'file2.text')).resolves({
        isFile: () => true,
        size: size2,
        isDirectory: () => false,
      } as any);
      fileOperationsStub.getFileStats.withArgs(path.join(subDir2, 'file3.text')).resolves({
        isFile: () => true,
        size: size1,
        isDirectory: () => false,
      } as any);

      fileOperationsStub.getFileStats.withArgs(path.join(subDir2, 'file4.text')).resolves({
        isFile: () => true,
        size: size2,
        isDirectory: () => false,
      } as any);

      const result: Map<number, string[]> = await directoryTraverser.traverse(directory);

      expect(result.size).to.equal(2);
      expect(result.get(size1)?.length).to.equal(2);
      expect(result.get(size2)?.length).to.equal(2);
    });

    it('should traverse and handle error gracefully when encountering directories without permission', async () => {
      const directory = 'testDirectory';
      const subDirectory = path.join(directory, 'subDirectory');
      const protectedDirectory = path.join(directory, 'protectedDirectory');

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'protectedDirectory', isDirectory: () => true, isFile: () => false },
        { name: 'subDirectory', isDirectory: () => true, isFile: () => false },
      ]);

      readdirStub.withArgs(protectedDirectory, { withFileTypes: true }).rejects(new Error('EACCESS: Permission denied'));
      readdirStub.withArgs(subDirectory, { withFileTypes: true }).resolves([
        { name: 'file1.text', isDirectory: () => false, isFile: () => true },
        { name: 'file2.text', isDirectory: () => false, isFile: () => true },
      ]);


      const size1 = 200;

      fileOperationsStub.getFileStats.withArgs(path.join(subDirectory, 'file1.text')).resolves({
        isFile: () => true,
        size: size1,
        isDirectory: () => false,
      } as any);
      fileOperationsStub.getFileStats.withArgs(path.join(subDirectory, 'file2.text')).resolves({
        isFile: () => true,
        size: size1,
        isDirectory: () => false,
      } as any);

      const result: Map<number, string[]> = await directoryTraverser.traverse(directory);

      sinon.assert.calledOnce(errorHandlerStub);

      expect(result.size).to.equal(1);
      expect(result.get(size1)?.length).to.equal(2);
    });

    it('should handle permission errors when accessing files', async () => {
      const rootDir = 'testDirectory';
      const restrictedFile = path.join(rootDir, 'restricted.txt');
      const accessibleFile = path.join(rootDir, 'accessible.txt');

      readdirStub.withArgs(rootDir, { withFileTypes: true }).resolves([
        { name: 'restricted.txt', isDirectory: () => false, isFile: () => true },
        { name: 'accessible.txt', isDirectory: () => false, isFile: () => true },
      ]);

      fileOperationsStub.getFileStats.callsFake(async (filePath) => {
        if (filePath === restrictedFile) {
          throw new Error('EACCESS: Permission denied'); // Restricted file
        }
        return { size: 100, isFile: () => true } as any; // Accessible file
      });

      const result = await directoryTraverser.traverse(rootDir);

      // Verify that the accessible file was counted but the restricted one was ignored
      expect(result.size).to.equal(1);
      expect(result.has(100)).to.be.true;
      expect(result.get(100)).to.deep.equal([accessibleFile]);

      sinon.assert.calledOnce(errorHandlerStub);
    });

  });
});