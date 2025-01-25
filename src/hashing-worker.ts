// hashing-worker.ts
import * as crypto from 'crypto';
import * as fs from 'fs';

export class HashingWorker {
    public static async hashFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('md5');
            const stream = fs.createReadStream(filePath);
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
}