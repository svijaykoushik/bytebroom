// error-handler.ts
export class ErrorHandler {
    public static handle(error: any, message?: string): void {
        if (message) {
            console.error(message, error);
        } else {
            console.error('An error occurred:', error);
        }
    }
}
