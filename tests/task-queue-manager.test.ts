import { TaskQueueManager, WorkerManager } from '../src/worker-manager';
import sinon from 'sinon';

describe('TaskQueueManager', () => {
  let taskQueueManager: TaskQueueManager;
  let workerManager: WorkerManager;
  let sandbox: sinon.SinonSandbox;
  let expect: Chai.ExpectStatic;

  before(async () => {
    const chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
    expect = chai.expect;
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    workerManager = new WorkerManager(2);
    taskQueueManager = new TaskQueueManager(workerManager);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should execute a task', async () => {
    const createWorkerStub = sandbox.stub(workerManager, 'createWorker').callsFake((data, cb) => {
      cb('result');
    });

    const result = await taskQueueManager.executeTask('testData');
    expect(createWorkerStub.calledOnce).to.be.true;
    expect(result).to.equal('result');
  });

  it('should queue tasks when no worker is available', async () => {
    const createWorkerStub = sandbox.stub(workerManager, 'createWorker');
    sandbox.stub(workerManager, 'canCreateWorker').returns(false);

    const promise1 = taskQueueManager.executeTask('testData1');
    const promise2 = taskQueueManager.executeTask('testData2');

    expect(createWorkerStub.notCalled).to.be.true;
    expect(taskQueueManager['taskQueue'].length).to.equal(2);

    sandbox.restore();
    sandbox = sinon.createSandbox();
    sandbox.stub(workerManager, 'canCreateWorker').returns(true);
    const createWorkerStub2 = sandbox.stub(workerManager, 'createWorker').callsFake((data, cb) => {
      cb('result');
    });
    workerManager.emit('workerFreed');
    await Promise.all([promise1, promise2]);
    expect(createWorkerStub2.calledTwice).to.be.true;
  });

  it('should process next task when worker is freed', async () => {
    const createWorkerStub = sandbox.stub(workerManager, 'createWorker');
    sandbox.stub(workerManager, 'canCreateWorker').returns(false);
    const promise1 = taskQueueManager.executeTask('testData1');
    const promise2 = taskQueueManager.executeTask('testData2');

    expect(createWorkerStub.notCalled).to.be.true;
    expect(taskQueueManager['taskQueue'].length).to.equal(2);

    sandbox.restore();
    sandbox = sinon.createSandbox();
    sandbox.stub(workerManager, 'canCreateWorker').returns(true);
    const createWorkerStub2 = sandbox.stub(workerManager, 'createWorker').callsFake((data, cb) => {
      cb('result');
    });
    workerManager.emit('workerFreed');
    await Promise.all([promise1, promise2]);
    expect(createWorkerStub2.calledTwice).to.be.true;
  });
});
