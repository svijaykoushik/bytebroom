import {TaskQueueManager, WorkerManager} from './worker-manager';
import {ByteBroom} from './byte-broom';
import {FileOperations} from './file-operations';
import {ArgumentParser} from './argument-parser';
import {ErrorHandler} from './error-handler';
import * as os from 'os';
import {isMainThread, parentPort, workerData} from 'worker_threads';
import {HashingWorker} from './hashing-worker';

if (!isMainThread) {
    HashingWorker.hashFile(workerData)
        .then((hash) => parentPort?.postMessage(hash))
        .catch((error) => parentPort?.postMessage(error));
} else {
    (async () => {
        const {directories, verbose, filter, exclude} = ArgumentParser.parse();

        try {
            const maxWorkers = os.cpus().length;
            const workerManager = new WorkerManager(maxWorkers);
            const taskQueueManager = new TaskQueueManager(workerManager);
            const fileOperations = new FileOperations();

            const byteBroom = new ByteBroom(
                {knownSystemDirs: ['/System', '/Windows', '/usr'], filter: filter || [], exclude: exclude || []},
                taskQueueManager,
                fileOperations,
            );
            await byteBroom.findDuplicates(directories, verbose);
        } catch (error) {
            ErrorHandler.handle(error);
            process.exit(1);
        }
    })();
}
