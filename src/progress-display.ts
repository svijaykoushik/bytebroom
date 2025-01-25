// progress-display.ts
export class ProgressDisplay {
    private totalFiles: number = 0;
    private processedFiles: number = 0;

    public setTotal(total: number): void {
        this.totalFiles = total;
    }

    public update(currentDir: string): void {
        this.processedFiles++;
        const progress = Math.min((this.processedFiles / this.totalFiles) * 100, 100).toFixed(2);
        const progressBar = '='.repeat(Math.floor((this.processedFiles / this.totalFiles) * 50)).padEnd(50, ' ');
        const line = `[${progressBar}] ${progress}% - Processing: ${currentDir}`;
        process.stdout.write(`\r${' '.repeat(process.stdout.columns)}\r${line}`);
    }
}