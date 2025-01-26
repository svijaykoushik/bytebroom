import {HashingWorker} from './hashing-worker';
import {parentPort, workerData} from 'worker_threads';

HashingWorker.hashFile(workerData)
    .then((hash) => parentPort?.postMessage(hash))
    .catch((error) => parentPort?.postMessage(error));
