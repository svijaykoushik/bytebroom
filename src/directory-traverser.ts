// directory-traverser.ts
import * as fs from 'fs';
import * as path from 'path';
import {EventEmitter} from 'events';
import {FileOperations} from './file-operations';
import {ErrorHandler} from './error-handler';

export class DirectoryTraverser extends EventEmitter {
    constructor(private knownSystemDirs: Set<string>, private fileOperations: FileOperations) {
        super();
    }

    public async countFiles(directory: string): Promise<number> {
        try {
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
        } catch (error) {
            ErrorHandler.handle(error, `Error counting files in ${directory}`);
            return 0;
        }
    }

    public async traverse(rootDir: string): Promise<Map<number, string[]>> {
        const sizeMap = new Map<number, string[]>();
        await this.traverseDirectory(rootDir, sizeMap);
        return sizeMap;
    }

    private async traverseDirectory(directory: string, sizeMap: Map<number, string[]>): Promise<void> {
        if (this.knownSystemDirs.has(directory)) return;

        try {
            const entries = await fs.promises.readdir(directory, {withFileTypes: true});
            for (const entry of entries) {
                const fullPath = path.join(directory, entry.name);
                if (entry.isDirectory()) {
                    await this.traverseDirectory(fullPath, sizeMap);
                } else if (entry.isFile()) {
                    this.emit('fileProcessed', directory);
                    const stats = await this.fileOperations.getFileStats(fullPath);
                    if (stats && stats.isFile()) {
                        const size = stats.size;
                        const files = sizeMap.get(size) || [];
                        files.push(fullPath);
                        sizeMap.set(size, files);
                    }
                }
            }
        } catch (error) {
            ErrorHandler.handle(error, `Error traversing directory ${directory}`);
        }
    }
}