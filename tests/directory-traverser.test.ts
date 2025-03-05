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
    knownSystemDirs = new Set(['system32', 'Program Files']);
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
  })
});