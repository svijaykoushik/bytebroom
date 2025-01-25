// file-operations.ts
import * as fs from 'fs';
import {ErrorHandler} from './error-handler';

export class FileOperations {
    public async getFileStats(filePath: string): Promise<fs.Stats | null> {
        try {
            return await fs.promises.stat(filePath);
        } catch (error) {
            ErrorHandler.handle(error, `Error reading file stats for ${filePath}`);
            return null;
        }
    }
}