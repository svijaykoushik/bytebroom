import * as fs from 'fs';
import * as path from 'path';
import {isMainThread, parentPort, Worker, workerData} from 'worker_threads';
import * as os from 'os';
import * as crypto from 'crypto';

class WorkerManager {
    private workers: Worker[] = [];
    private readonly maxWorkerSize: number;
    private readonly taskQueue: { data: string; cb: (result: any) => void; errCb: (error: any) => void }[] = [];

    constructor(maxWorkerSize: number) {
        this.maxWorkerSize = maxWorkerSize;
    }

    public async executeWorker(data: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.taskQueue.push({data, cb: resolve, errCb: reject});
            this.processNextTask();
        });
    }

    private processNextTask(): void {
        if (this.taskQueue.length > 0 && this.workers.length < this.maxWorkerSize) {
            const task = this.taskQueue.shift();
            this.createWorker(task!.data, task!.cb, task!.errCb);
        }
    }

    private createWorker(data: string, cb: (result: any) => void, errCb: (error: any) => void): void {
        const worker = new Worker(__filename, {workerData: data});
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
        this.processNextTask();
    }
}


interface Options {
    knownSystemDirs: string[];
}

class ByteBroom {
    private knownSystemDirs: Set<string>;
    private readonly maxWorkers: number;
    private totalFiles: number = 0;
    private processedFiles: number = 0;
    private workerManager: WorkerManager;

    constructor(options: Options) {
        this.knownSystemDirs = new Set(options.knownSystemDirs.map(dir => path.resolve(dir)));
        this.maxWorkers = os.cpus().length;
        this.workerManager = new WorkerManager(this.maxWorkers);
    }

    public async findDuplicates(directory: string, verbose: boolean = false): Promise<void> {
        const fileHashes = new Map<string, string>();
        const duplicates = new Map<string, string[]>();

        this.totalFiles = await this.countFiles(directory);
        this.processedFiles = 0;

        await this.traverseDirectory(directory, fileHashes, duplicates);

        this.printResults(duplicates, verbose);
    }

    private async countFiles(directory: string): Promise<number> {
        const entries = await fs.promises.readdir(directory, {withFileTypes: true});
        let count = 0;

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                count += await this.countFiles(fullPath);
            } else if (entry.isFile()) {
                count++;
            }
        }

        return count;
    }

    private displayProgress(currentDir: string): void {
        const progress = Math.min((this.processedFiles / this.totalFiles) * 100, 100).toFixed(2);
        const progressBar = '='.repeat(Math.floor((this.processedFiles / this.totalFiles) * 50)).padEnd(50, ' ');
        const line = `[${progressBar}] ${progress}% - Processing: ${currentDir}`;
        const overwriteLine = ' '.repeat(process.stdout.columns);
        process.stdout.write(`\r${overwriteLine}\r${line}`);
    }

    private async traverseDirectory(
        directory: string,
        fileHashes: Map<string, string>,
        duplicates: Map<string, string[]>
    ): Promise<void> {
        if (this.knownSystemDirs.has(directory)) {
            return;
        }

        const entries = await fs.promises.readdir(directory, { withFileTypes: true });
        const sizeMap = new Map<number, string[]>();

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                await this.traverseDirectory(fullPath, fileHashes, duplicates);
            } else if (entry.isFile()) {
                this.processedFiles++;
                this.displayProgress(directory);

                try {
                    const {size} = await fs.promises.stat(fullPath);

                    if (!sizeMap.has(size)) {
                        sizeMap.set(size, []);
                    }
                    sizeMap.get(size)!.push(fullPath);
                } catch (error) {
                    console.error(`Error reading file size for ${fullPath}:`, error);
                }
            }
        }

        for (const [, files] of sizeMap.entries()) {
            if (files.length > 1) {
                for (const file of files) {
                    try {
                        const hash = await this.workerManager.executeWorker(file);

                        if (fileHashes.has(hash)) {
                            const originalPath = fileHashes.get(hash) as string;
                            if (!duplicates.has(hash)) {
                                duplicates.set(hash, [originalPath]);
                            }
                            duplicates.get(hash)?.push(file);
                        } else {
                            fileHashes.set(hash, file);
                        }
                    } catch (error) {
                        console.error(`Error processing file ${file}:`, error);
                    }
                }
            }
        }
    }

    private printResults(duplicates: Map<string, string[]>, verbose: boolean): void {
        process.stdout.write('\n');
        if (duplicates.size > 0) {
            console.log('Duplicate Files');

            const summaryTable: any[] = [];
            let totalDuplicateFiles = 0;
            let totalDuplicateSize = 0;
            let totalRecoveryPotential = 0;

            duplicates.forEach((files, hash) => {
                const fileSize = fs.statSync(files[0]).size;
                const duplicateFileSize = fileSize * (files.length - 1);

                totalDuplicateFiles += files.length;
                totalDuplicateSize += duplicateFileSize;
                totalRecoveryPotential += duplicateFileSize;

                summaryTable.push({
                    'File Paths': `${path.basename(files[0])} (${files.length} files)`,
                    'Duplicate File Size': this.formatSize(fileSize),
                    'Recovery Potential': this.formatSize(duplicateFileSize),
                    Hash: hash,
                });

                if (verbose) {
                    files.forEach((file, index) => {
                        summaryTable.push({
                            'File Paths': `  File ${index + 1}: ${file}`,
                            'Duplicate File Size': '',
                            'Recovery Potential': '',
                            Hash: '',
                        });
                    });
                }
            });

            console.table(summaryTable);

            console.log('Summary Statistics');
            console.log(`Total Duplicate Files: ${totalDuplicateFiles}`);
            console.log(`Total Duplicate File Size: ${this.formatSize(totalDuplicateSize)}`);
            console.log(`Total Recovery Potential: ${this.formatSize(totalRecoveryPotential)}`);
        } else {
            console.log('No duplicate files found.');
        }
    }

    private formatSize(size: number): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
}

if (!isMainThread) {
    const filePath: string = workerData;
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => {
        const computedHash = hash.digest('hex');
        parentPort?.postMessage(computedHash);
    });
    stream.on('error', error => {
        parentPort?.postMessage(error);
    });
} else {
    (async () => {
        const knownSystemDirs = ['/System', '/Windows', '/usr'];
        const finder = new ByteBroom({knownSystemDirs});

        const directoryToScan = process.argv[2];
        const verbose = process.argv.includes('--verbose');
        const help: boolean = process.argv.includes('--help');

        if (!directoryToScan || help) {
            console.log(`Usage:
  duplicate-finder [/path/to/directory]
Flags:
  --help         help for duplicate-finder
  --verbose      provide a verbose report`);
            process.exit(0);
        }

        try {
            await finder.findDuplicates(path.resolve(directoryToScan), verbose);
        } catch (error) {
            console.error('An error occurred:', error);
            process.exit(1);
        }
    })();
}
