import sinon from 'sinon';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { HashingWorker } from '../src/hashing-worker';

describe('HashingWorker', function() {
  let createHashStub: sinon.SinonStub;
  let createReadStreamStub: sinon.SinonStub;
  let hashMock: sinon.SinonStubbedInstance<crypto.Hash>;
  let readStreamMock: sinon.SinonStubbedInstance<fs.ReadStream>;
  let expect: Chai.ExpectStatic;

  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });

  beforeEach(function() {
    hashMock = sinon.createStubInstance(crypto.Hash);
    hashMock.update.returns(hashMock);
    hashMock.digest.returns('mockedhash');
    createHashStub = sinon.stub(crypto, 'createHash').returns(hashMock);

    readStreamMock = sinon.createStubInstance(fs.ReadStream);
    createReadStreamStub = sinon.stub(fs, 'createReadStream').returns(readStreamMock);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('hashFile', function() {
    it('should correctly hash the file content', async function() {
      const hashPromise = HashingWorker.hashFile('/path/to/file');
      readStreamMock.emit('data', Buffer.from('test data'));
      readStreamMock.emit('end');

      const result = await hashPromise;
      expect(result).to.equal('mockedhash');
      expect(createHashStub.calledOnceWithExactly('md5')).to.be.true;
      expect(hashMock.update.calledWithExactly(Buffer.from('test data'))).to.be.true;
      expect(hashMock.digest.calledOnceWithExactly('hex')).to.be.true;
    });

    it('should reject on stream error', async function() {
      const error = new Error('Stream error');
      const hashPromise = HashingWorker.hashFile('/path/to/file');
      readStreamMock.emit('error', error);

      await expect(hashPromise).to.be.rejectedWith('Stream error');
      expect(createHashStub.calledOnceWithExactly('md5')).to.be.true;
    });
  });
});
