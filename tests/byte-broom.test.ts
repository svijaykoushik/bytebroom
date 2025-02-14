import { expect } from 'chai';
import * as sinon from 'sinon';
import { ByteBroom } from '../src/byte-broom';
import { DirectoryTraverser } from '../src/directory-traverser';
import { DuplicateDetector } from '../src/duplicate-detector';
import { TaskQueueManager } from '../src/worker-manager';
import { FileOperations } from '../src/file-operations';
import { ProgressDisplay } from '../src/progress-display';
import { DuplicateFileDeleter } from '../src/duplicate-file-deleter';
import { Utils } from '../src/utils';

describe('ByteBroom', function() {
  let byteBroom: ByteBroom;
  let mockTaskQueueManager: sinon.SinonStubbedInstance<TaskQueueManager>;
  let mockFileOperations: sinon.SinonStubbedInstance<FileOperations>;
  let mockDirectoryTraverser: sinon.SinonStubbedInstance<DirectoryTraverser>;
  let mockDuplicateDetector: sinon.SinonStubbedInstance<DuplicateDetector>;
  let mockTraverseProgressDisplay: sinon.SinonStubbedInstance<ProgressDisplay>;
  let mockScanProgressDisplay: sinon.SinonStubbedInstance<ProgressDisplay>;
  let mockDeleteProgressDisplay: sinon.SinonStubbedInstance<ProgressDisplay>;
  let mockDeleter: sinon.SinonStubbedInstance<DuplicateFileDeleter>;

  const mockOptions = {
    knownSystemDirs: ['/system', '/private'],
    filter: ['jpg', 'png'],
    exclude: ['mp4', 'exe'],
  };

  beforeEach(() => {
    mockTaskQueueManager = sinon.createStubInstance(TaskQueueManager);
    mockFileOperations = sinon.createStubInstance(FileOperations);
    mockDirectoryTraverser = sinon.createStubInstance(DirectoryTraverser);
    mockDuplicateDetector = sinon.createStubInstance(DuplicateDetector);
    mockTraverseProgressDisplay = sinon.createStubInstance(ProgressDisplay);
    mockScanProgressDisplay = sinon.createStubInstance(ProgressDisplay);
    mockDeleteProgressDisplay = sinon.createStubInstance(ProgressDisplay);
    mockDeleter = sinon.createStubInstance(DuplicateFileDeleter);

    // Mock method calls for DirectoryTraverser
    mockDirectoryTraverser.countFiles.resolves(10);
    mockDirectoryTraverser.traverse.resolves(new Map());

    // Mock method calls for DuplicateDetector
    mockDuplicateDetector.detectDuplicates.resolves(new Map());

    // Stub class instances inside ByteBroom
    sinon.stub(DirectoryTraverser.prototype, 'on');
    sinon.stub(DuplicateDetector.prototype, 'on');

    byteBroom = new ByteBroom(mockOptions, mockTaskQueueManager, mockFileOperations);

    // Replace private properties with stubs
    (byteBroom as any).directoryTraverser = mockDirectoryTraverser;
    (byteBroom as any).duplicateDetector = mockDuplicateDetector;
    (byteBroom as any).traverseProgressDisplay = mockTraverseProgressDisplay;
    (byteBroom as any).scanProgressDisplay = mockScanProgressDisplay;
    (byteBroom as any).deleteProgressDisplay = mockDeleteProgressDisplay;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should initialize with given options', () => {
      expect((byteBroom as any).knownSystemDirs).to.be.instanceOf(Set);
      expect((byteBroom as any).knownSystemDirs.has('/system')).to.be.true;
      expect((byteBroom as any).knownSystemDirs.has('/private')).to.be.true;
    });

    it('should set up event listeners for DirectoryTraverser and DuplicateDetector', () => {
      expect(DirectoryTraverser.prototype.on.called).to.be.true;
      expect(DuplicateDetector.prototype.on.called).to.be.true;
    });
  });

  describe('findDuplicates', () => {
    it('should count files in each directory', async () => {
      await byteBroom.findDuplicates(['/test'], false);
      expect(mockDirectoryTraverser.countFiles.calledOnceWithExactly('/test')).to.be.true;
    });

    it('should initialize progress displays correctly', async () => {
      await byteBroom.findDuplicates(['/test'], false);
      expect(mockTraverseProgressDisplay.setTotal.calledWith(10)).to.be.true;
    });

    it('should traverse directories and detect duplicates', async () => {
      const testMap = new Map<number, string[]>();
      testMap.set(1024, ['/test/file1.jpg', '/test/file2.jpg']);
      mockDirectoryTraverser.traverse.resolves(testMap);
      mockDuplicateDetector.detectDuplicates.resolves(testMap);

      await byteBroom.findDuplicates(['/test'], false);

      expect(mockDirectoryTraverser.traverse.calledOnceWithExactly('/test')).to.be.true;
      expect(mockDuplicateDetector.detectDuplicates.calledOnce).to.be.true;
    });

    it('should print \'No Duplicates Found\' when no duplicates exist', async () => {
      const consoleStub = sinon.stub(process.stdout, 'write');

      await byteBroom.findDuplicates(['/test'], false);

      expect(consoleStub.calledWith('No Duplicates Found')).to.be.true;
      consoleStub.restore();
    });

    it('should merge size maps correctly', async () => {
      const testMap1 = new Map<number, string[]>([[1024, ['/dir1/file1.jpg']]]);
      const testMap2 = new Map<number, string[]>([[2048, ['/dir2/file2.jpg']]]);
      mockDirectoryTraverser.traverse.onFirstCall().resolves(testMap1);
      mockDirectoryTraverser.traverse.onSecondCall().resolves(testMap2);

      const mergeStub = sinon.stub(Utils, 'mergeMaps').returns(new Map([...testMap1, ...testMap2]));

      await byteBroom.findDuplicates(['/dir1', '/dir2'], false);

      expect(mergeStub.calledOnceWithExactly(testMap1, testMap2)).to.be.true;
      mergeStub.restore();
    });

    it('should delete detected duplicates', async () => {
      const testMap = new Map<number, string[]>();
      testMap.set(1024, ['/test/file1.jpg', '/test/file2.jpg']);
      mockDuplicateDetector.detectDuplicates.resolves(testMap);

      const deleterStub = sinon.stub().returns(mockDeleter);
      sinon.replace(DuplicateFileDeleter.prototype, 'constructor', deleterStub);

      await byteBroom.findDuplicates(['/test'], false);

      expect(mockDeleter.run.calledOnce).to.be.true;
    });

    it('should set progress display correctly when deleting files', async () => {
      const testMap = new Map<number, string[]>();
      testMap.set(1024, ['/test/file1.jpg', '/test/file2.jpg']);
      mockDuplicateDetector.detectDuplicates.resolves(testMap);

      sinon.stub(DuplicateFileDeleter.prototype, 'run').callsFake(async function(this: any) {
        this.emit('totalSelectedFiles', 2);
        this.emit('fileTrashed', '/test/file1.jpg');
        this.emit('fileTrashed', '/test/file2.jpg');
        this.emit('allFilesTrashed');
      });

      await byteBroom.findDuplicates(['/test'], false);

      expect(mockDeleteProgressDisplay.setTotal.calledWith(2)).to.be.true;
      expect(mockDeleteProgressDisplay.update.calledTwice).to.be.true;
      expect(mockDeleteProgressDisplay.finish.calledOnce).to.be.true;
    });
  });

  describe('private methods', () => {
    it('should correctly count files to scan', () => {
      const testMap = new Map<number, string[]>([[1024, ['file1', 'file2']]]);
      const count = (byteBroom as any).countTotalFilesToScan(testMap);
      expect(count).to.equal(2);
    });

    it('should print \'No Duplicates Found\' when no duplicates exist', () => {
      const consoleStub = sinon.stub(process.stdout, 'write');

      (byteBroom as any).printNoDuplicates();

      expect(consoleStub.calledWith('No Duplicates Found')).to.be.true;
      consoleStub.restore();
    });
  });
});
