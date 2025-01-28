// duplicate-detector.ts
import {TaskQueueManager} from './worker-manager';
import {ErrorHandler} from './error-handler';
import {EventEmitter} from 'events';

export class DuplicateDetector extends EventEmitter {
  constructor(private taskQueueManager: TaskQueueManager) {
    super();
  }

  public async detectDuplicates(sizeMap: Map<number, string[]>): Promise<Map<string, string[]>> {
    const fileHashes = new Map<string, string>();
    const duplicates = new Map<string, string[]>();

    for (const [, files] of sizeMap) {
      if (files.length <= 1) {
        files.length && this.emit('fileScanned', files[0]);
        continue;
      }
      const promises = files.map(async (file: string) => {
        try {
          const hash = await this.taskQueueManager.executeTask(file);
          if (fileHashes.has(hash)) {
            const original = fileHashes.get(hash)!;
            duplicates.set(hash, [original, file]);
          } else {
            fileHashes.set(hash, file);
          }
        } catch (error) {
          ErrorHandler.handle(error, `Error processing file ${file}`);
        } finally {
          this.emit('fileScanned', file);
        }
      });

      await Promise.all(promises);
    }
    return duplicates;
  }
}
