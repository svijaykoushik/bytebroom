// worker-management.ts
import {Worker} from 'worker_threads';
import {EventEmitter} from 'events';
import {resolve} from 'path';

export class WorkerManager extends EventEmitter {
    private workers: Worker[] = [];

    constructor(private maxWorkerSize: number) {
        super();
    }

    public canCreateWorker(): boolean {
        return this.workers.length < this.maxWorkerSize;
    }

    public createWorker(data: string, cb: (result: any) => void, errCb: (error: any) => void): void {
        const path =
            process.env.NODE_ENV === 'developement'
                ? resolve(__dirname, './file-hash-worker.ts')
                : resolve(__dirname, './file-hash-worker.js');
        const worker = new Worker(path, {
            workerData: data,
            // env:  process.env.NODE_ENV === 'development' ? { NODE_OPTIONS: "--import tsx" } : undefined,
            execArgv: process.env.NODE_ENV === 'development' ? ['-r', 'ts-node/register'] : undefined,
        });
        this.workers.push(worker);

        worker.on('message', (result) => {
            this.removeWorker(worker);
            cb(result);
        });

        worker.on('error', (error) => {
            this.removeWorker(worker);
            errCb(error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                this.removeWorker(worker);
                errCb(new Error(`Worker exited with code ${code}`));
            }
        });
    }

    private removeWorker(worker: Worker): void {
        const index = this.workers.indexOf(worker);
        if (index !== -1) {
            this.workers.splice(index, 1);
        }
        this.emit('workerFreed');
    }
}

export class TaskQueueManager {
    private taskQueue: { data: string; cb: (result: any) => void; errCb: (error: any) => void }[] =
        [];

    constructor(private workerManager: WorkerManager) {
        workerManager.on('workerFreed', () => this.processNextTask());
    }

    public async executeTask(data: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.taskQueue.push({data, cb: resolve, errCb: reject});
            this.processNextTask();
        });
    }

    private processNextTask(): void {
        while (this.taskQueue.length > 0 && this.workerManager.canCreateWorker()) {
            const task = this.taskQueue.shift();
            if (task) {
                this.workerManager.createWorker(task.data, task.cb, task.errCb);
            }
        }
    }
}
