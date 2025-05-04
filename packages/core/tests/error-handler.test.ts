import sinon from 'sinon';
import { ErrorHandler } from '../src/error-handler';

describe('ErrorHandler', () => {
  let consoleErrorStub: sinon.SinonStub;
  let expect: Chai.ExpectStatic;
  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
  });
  beforeEach(() => {
    consoleErrorStub = sinon.stub(console, 'error');
  });
  afterEach(() => {
    consoleErrorStub.restore();
  });
  it('should log an error with message', () => {
    const error = new Error('Test error');
    const message = 'Test message';
    ErrorHandler.handle(error, message);
    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(consoleErrorStub.calledWith(message, error)).to.be.true;
  });
  it('should log an error without a message', () => {
    const error = new Error('Test error');
    ErrorHandler.handle(error);
    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(consoleErrorStub.calledWith('An error occurred:', error)).to.be.true;
  });
  it('should handle String as error', () => {
    const stringError = 'String error';

    ErrorHandler.handle(stringError);

    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(consoleErrorStub.calledWith('An error occurred:', stringError)).to.be.true;
  });
  it('should handle Number as error', () => {
    const numberError = 123;

    ErrorHandler.handle(numberError);

    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(consoleErrorStub.calledWith('An error occurred:', numberError)).to.be.true;
  });

  it('should handle undefined error', () => {
    ErrorHandler.handle(undefined);

    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(consoleErrorStub.calledWith('An error occurred:', undefined)).to.be.true;
  });
});