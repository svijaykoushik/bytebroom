import sinon from 'sinon';
import { EventEmitter } from 'events';
import { DirectoryTraverser } from '../src/directory-traverser';
import { DirectoryScanner } from '../src/directory-scanner';
import { Utils } from '../src/utils';

describe('DirectoryScanner', function() {
  let directoryScanner: DirectoryScanner;
  let directoryTraverserStub: sinon.SinonStubbedInstance<DirectoryTraverser>;
  let utilsStub: sinon.SinonStub;
  let expect: Chai.ExpectStatic;
  before(async () => {
    const chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
    expect = chai.expect;
  });

  beforeEach(function() {
    directoryTraverserStub = sinon.createStubInstance(DirectoryTraverser);
    utilsStub = sinon.stub(Utils, 'mergeMaps').returns(new Map());
    directoryScanner = new DirectoryScanner(directoryTraverserStub);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('Instantiation', function() {
    it('should instantiate DirectoryScanner correctly', function() {
      expect(directoryScanner).to.be.instanceOf(DirectoryScanner);
      expect(directoryScanner).to.be.instanceOf(EventEmitter);
    });

    // TODO Research on testing event emitting
    // it('should set up event listener for fileProcessed', async function() {
    //   const emitSpy = sinon.spy(directoryScanner, 'emit');
    //
    //   // Setup the stub to resolve the promise and *eventually* emit 'fileProcessed'
    //   directoryTraverserStub.traverse.resolves(new Map()); // Resolve the promise
    //   directoryTraverserStub.countFiles.resolves(0)
    //
    //   // Call the scan method, which will trigger the traverser and eventually events
    //   await directoryScanner.scan(['/testDir']);  // Await the scan completion
    //
    //   // Now the events should have been processed.
    //   expect(emitSpy.calledWith('directoryProcessed', '/testDir')).to.be.true;
    // });
  });

  describe('scan', function() {
    it('should correctly scan directories and merge results', async function() {
      const mockMap1 = new Map([[100, ['file1', 'file2']]]);
      const mockMap2 = new Map([[200, ['file3']]]);
      directoryTraverserStub.countFiles.withArgs('/dir1').resolves(2);
      directoryTraverserStub.countFiles.withArgs('/dir2').resolves(1);
      directoryTraverserStub.traverse.withArgs('/dir1').resolves(mockMap1);
      directoryTraverserStub.traverse.withArgs('/dir2').resolves(mockMap2);

      const emitSpy = sinon.spy(directoryScanner, 'emit');
      const result = await directoryScanner.scan(['/dir1', '/dir2']);

      expect(emitSpy.calledWith('totalFilesAvailable', 3)).to.be.true;
      expect(emitSpy.calledWith('scanComplete')).to.be.true;
      expect(utilsStub.calledWith(mockMap1, mockMap2)).to.be.true;
      expect(result).to.be.an.instanceOf(Map);
    });

    it('should handle empty directories correctly', async function() {
      directoryTraverserStub.countFiles.resolves(0);
      directoryTraverserStub.traverse.resolves(new Map());

      const emitSpy = sinon.spy(directoryScanner, 'emit');
      const result = await directoryScanner.scan(['/emptyDir']);

      expect(emitSpy.calledWith('totalFilesAvailable', 0)).to.be.true;
      expect(emitSpy.calledWith('scanComplete')).to.be.true;
      expect(result.size).to.equal(0);
    });

    it('should handle null and undefined inputs gracefully', async function() {
      await expect(directoryScanner.scan([])).to.eventually.be.an.instanceOf(Map);
      const error = new Error();
      error.name = 'DirectoryScanError';
      error.message = 'Expected directories to be an array';
      await expect(directoryScanner.scan(null as any)).to.be.rejected;
      await expect(directoryScanner.scan(undefined as any)).to.be.rejected;
    });

    it('should propagate errors from DirectoryTraverser', async function() {
      directoryTraverserStub.countFiles.rejects(new Error('Test Error'));
      await expect(directoryScanner.scan(['/dir1'])).to.be.rejectedWith('Test Error');
    });
  });
});
