// results-printer.ts
import * as fs from 'fs';
import * as path from 'path';

export class ResultsPrinter {
    public static print(duplicates: Map<string, string[]>, verbose: boolean): void {
        process.stdout.write('\n');
        if (duplicates.size === 0) {
            console.log('No duplicate files found.');
            return;
        }

        console.log('Duplicate Files');
        const summaryTable: any[] = [];
        let totalDuplicateFiles = 0;
        let totalDuplicateSize = 0;

        duplicates.forEach((files, hash) => {
            const fileSize = fs.statSync(files[0]).size;
            const recoveryPotential = fileSize * (files.length - 1);
            totalDuplicateFiles += files.length;
            totalDuplicateSize += recoveryPotential;

            summaryTable.push({
                'File Paths': `${path.basename(files[0])} (${files.length} files)`,
                'Duplicate Size': this.formatSize(fileSize),
                'Recovery Potential': this.formatSize(recoveryPotential),
                Hash: hash
            });

            if (verbose) {
                files.forEach((file, index) => {
                    summaryTable.push({
                        'File Paths': `  File ${index + 1}: ${file}`,
                        'Duplicate Size': '',
                        'Recovery Potential': '',
                        Hash: ''
                    });
                });
            }
        });

        console.table(summaryTable);
        console.log('Summary Statistics');
        console.log(`Total Duplicate Files: ${totalDuplicateFiles}`);
        console.log(`Total Recovery Potential: ${this.formatSize(totalDuplicateSize)}`);
    }

    private static formatSize(size: number): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
}