// progress-display.ts
export class ProgressDisplay {
  private totalFiles: number = 0;
  private processedFiles: number = 0;

  public setTotal(total: number): void {
    this.totalFiles = total;
  }

  public update(progressText: string): void {
    this.processedFiles++;
    const progress = Math.min((this.processedFiles / this.totalFiles) * 100, 100).toFixed(2);
    const progressBar = '='
        .repeat(Math.floor((this.processedFiles / this.totalFiles) * 50))
        .padEnd(50, ' ');

    // Calculate available width for progressText
    const availableWidth = process.stdout.columns - `[${progressBar}] ${progress}% - `.length;

    // Truncate progressText if it's too long
    let truncatedText = progressText;
    if (truncatedText.length > availableWidth) {
      truncatedText = truncatedText.substring(0, availableWidth - 3) + '...'; // Add ellipsis
    }

    const line = `[${progressBar}] ${progress}% - ${truncatedText}`;
    process.stdout.clearLine(0); // Clear current line
    process.stdout.cursorTo(0); // Move cursor to beginning of line
    process.stdout.write(line);
  }

  public finish(): void {
    process.stdout.write('\n');
  }
}
