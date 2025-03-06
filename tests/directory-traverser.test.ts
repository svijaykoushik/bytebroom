import { FileOperations } from '../src/file-operations';
import sinon from 'sinon';
import { DirectoryTraverser } from '../src/directory-traverser';
import * as fs from 'fs';

describe('Directory Traverser', () => {
  let knownSystemDirs: Set<string> = new Set();
  let fileOperationsStub: sinon.SinonStubbedInstance<FileOperations>;
  let filterFileExtensions: string[] = [];
  let excludeExtensions: string[] = [];
  let directoryTraverser: DirectoryTraverser;
  let expect: Chai.ExpectStatic;
  let readdirStub: sinon.SinonStub;

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
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Instantiation', () => {
    it('should be instance of DirectoryTraverser', () => {
      expect(directoryTraverser).to.be.instanceof(DirectoryTraverser);
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

    it('should count other directories when last does not have permission', async () => {
      const directory = 'testDirectory';

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'subDirectory', isDirectory: () => true, isFile: () => false },
        { name: 'protectedDirectory', isDirectory: () => true, isFile: () => false },
      ]);

      readdirStub.withArgs(`${directory}/subDirectory`, { withFileTypes: true }).resolves([
        { name: 'file1.text', isDirectory: () => false, isFile: () => true },
        { name: 'file2.text', isDirectory: () => false, isFile: () => true },
      ]);

      readdirStub.withArgs(`${directory}/protectedDirectory`, { withFileTypes: true }).rejects(new Error('EACCESS: Permission denied'));

      const count = await directoryTraverser.countFiles(directory);

      expect(count).to.equal(2);
    });

    it('should count other directories when first does not have permission', async () => {
      const directory = 'testDirectory';

      readdirStub.withArgs(directory, { withFileTypes: true }).resolves([
        { name: 'protectedDirectory', isDirectory: () => true, isFile: () => false },
        { name: 'subDirectory', isDirectory: () => true, isFile: () => false },
      ]);

      readdirStub.withArgs(`${directory}/protectedDirectory`, { withFileTypes: true }).rejects(new Error('EACCESS: Permission denied'));

      readdirStub.withArgs(`${directory}/subDirectory`, { withFileTypes: true }).resolves([
        { name: 'file1.text', isDirectory: () => false, isFile: () => true },
        { name: 'file2.text', isDirectory: () => false, isFile: () => true },
      ]);

      const count = await directoryTraverser.countFiles(directory);

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
      const fullPath = directory + '/' + fileName;
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

  });
});