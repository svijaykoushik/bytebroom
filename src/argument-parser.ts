// argument-parser.ts
import * as path from 'path';

export class ArgumentParser {
    public static parse(args: string[]): { directory?: string; verbose: boolean; help: boolean } {
        const directory = args.find((arg) => !arg.startsWith('--'));
        return {
            directory: directory ? path.resolve(directory) : undefined,
            verbose: args.includes('--verbose'),
            help: args.includes('--help'),
        };
    }
}
