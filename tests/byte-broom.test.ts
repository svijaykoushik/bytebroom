import * as sinon from 'sinon';
import { ByteBroom } from '../src/byte-broom';
import { DirectoryScanner } from '../src/directory-scanner';
import { DuplicateFinder } from '../src/duplicate-finder';
import { DuplicateRemover } from '../src/duplicate-reomver';

describe('ByteBroom', function() {
  let expect: Chai.ExpectStatic;
  let directoryScannerStub: sinon.SinonStubbedInstance<DirectoryScanner>;
  let duplicateFinderStub: sinon.SinonStubbedInstance<DuplicateFinder>;
  let duplicateRemoverStub: sinon.SinonStubbedInstance<DuplicateRemover>;
  let byteBroom: ByteBroom;
  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });

  beforeEach(() => {
    // Create stub instances for each dependency
    directoryScannerStub = sinon.createStubInstance(DirectoryScanner);
    duplicateFinderStub = sinon.createStubInstance(DuplicateFinder);
    duplicateRemoverStub = sinon.createStubInstance(DuplicateRemover);

    // Inject stubs into our ByteBroom instance
    byteBroom = new ByteBroom(
      directoryScannerStub as unknown as DirectoryScanner,
      duplicateFinderStub as unknown as DuplicateFinder,
      duplicateRemoverStub as unknown as DuplicateRemover,
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('findDuplicates', () => {
    it('should scan directories, find duplicates, and remove them', async () => {
      const directories = ['/test1', '/test2'];
      const fakeSizeMap = new Map<number, string[]>([[1024, ['/test1/file1.jpg']]]);
      const fakeDuplicates = new Map<string, string[]>([
        ['hash123', ['/test1/file1.jpg', '/test2/file2.jpg']],
      ]);

      // Stub the dependency methods to resolve with our fake data
      directoryScannerStub.scan.resolves(fakeSizeMap);
      duplicateFinderStub.findDuplicates.resolves(fakeDuplicates);
      duplicateRemoverStub.removeDuplicates.resolves();

      // Execute the method under test
      await byteBroom.findDuplicates(directories);

      // Assert that each dependency was called with the correct arguments
      sinon.assert.calledOnceWithExactly(directoryScannerStub.scan, directories);
      sinon.assert.calledOnceWithExactly(duplicateFinderStub.findDuplicates, fakeSizeMap);
      sinon.assert.calledOnceWithExactly(duplicateRemoverStub.removeDuplicates, fakeDuplicates);
    });

    it('should propagate errors from directoryScanner.scan', async () => {
      const error = new Error('Scan failed');
      directoryScannerStub.scan.rejects(error);

      try {
        await byteBroom.findDuplicates(['/test']);
        expect.fail('Expected error was not thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });

    it('should propagate errors from duplicateFinder.findDuplicates', async () => {
      const directories = ['/test'];
      const fakeSizeMap = new Map<number, string[]>([[1024, ['/test/file1.jpg']]]);
      const error = new Error('Duplicate detection failed');

      directoryScannerStub.scan.resolves(fakeSizeMap);
      duplicateFinderStub.findDuplicates.rejects(error);

      try {
        await byteBroom.findDuplicates(directories);
        expect.fail('Expected error was not thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });

    it('should propagate errors from duplicateRemover.removeDuplicates', async () => {
      const directories = ['/test'];
      const fakeSizeMap = new Map<number, string[]>([[1024, ['/test/file1.jpg']]]);
      const fakeDuplicates = new Map<string, string[]>([
        ['hash123', ['/test/file1.jpg']],
      ]);
      const error = new Error('Remove duplicates failed');

      directoryScannerStub.scan.resolves(fakeSizeMap);
      duplicateFinderStub.findDuplicates.resolves(fakeDuplicates);
      duplicateRemoverStub.removeDuplicates.rejects(error);

      try {
        await byteBroom.findDuplicates(directories);
        expect.fail('Expected error was not thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });
});
