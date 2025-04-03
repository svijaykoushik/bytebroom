import sinon from 'sinon';
import fs from 'fs';
import * as path from 'path';
import { FileOperations } from '../src/file-operations';
import { ErrorHandler } from '../src/error-handler';

describe('FileOperations', function() {
  let fileOperations: FileOperations;
  let statStub: sinon.SinonStub;
  let errorHandlerStub: sinon.SinonStub;
  let expect: Chai.ExpectStatic;

  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });

  beforeEach(function() {
    fileOperations = new FileOperations();
    statStub = sinon.stub(fs.promises, 'stat');
    errorHandlerStub = sinon.stub(ErrorHandler, 'handle');
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('getFileStats', function() {
    it('should return file stats when the file exists', async function() {
      const fakeStats = { size: 1000 } as fs.Stats;
      statStub.resolves(fakeStats);

      const result = await fileOperations.getFileStats('/path/to/file');
      expect(result).to.equal(fakeStats);
      expect(statStub.calledOnceWithExactly('/path/to/file')).to.be.true;
    });

    it('should return null and handle error when file does not exist', async function() {
      const error = new Error('File not found');
      statStub.rejects(error);

      const result = await fileOperations.getFileStats('/invalid/path');
      expect(result).to.be.null;
      expect(statStub.calledOnceWithExactly('/invalid/path')).to.be.true;
      expect(errorHandlerStub.calledOnceWithExactly(error, 'Error reading file stats for /invalid/path')).to.be.true;
    });

    it('should return file stats when file name has emojis', async () => {
      const fakeStats = { size: 1308 } as fs.Stats;
      const filePath = path.join('/path/to/file 🕹️.txt');
      statStub.resolves(fakeStats);

      const result = await fileOperations.getFileStats(filePath);
      expect(result).to.equal(fakeStats);
      expect(statStub.calledOnceWithExactly(filePath)).to.be.true;
    });
  });
});