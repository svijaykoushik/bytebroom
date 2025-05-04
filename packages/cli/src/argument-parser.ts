// argument-parser.ts
import * as path from 'path';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

export class ArgumentParser {
    public static parse(): { verbose: boolean; directories: string[]; filter?: string[], exclude?: string[] } {
    const args = yargs(hideBin(process.argv))
      .command(
          '$0 <directories...>',
        'Scan a directory for duplicate files',
        (yargs) => {
          yargs
            .positional('directory', {
              describe: 'Directory to scan for duplicates',
              type: 'string',
                coerce: (dirs: string[]) => {
                    return dirs.map((dir) => path.resolve(dir.trim()));
                },
            });
        },
      )
      .demandCommand(1)
      .option('verbose', {
        alias: 'v',
        type: 'boolean',
        default: false,
        describe: 'Provide a verbose report',
      })
      .option('filter', {
        alias: 'f',
        type: 'string',
        describe: 'Comma-separated list of file extensions to filter (e.g., jpg,png,txt)',
        coerce: (filter: string) =>
          filter
            ? filter
              .split(',')
              .map((ext) => ext.trim().toLowerCase())
              .filter((ext) => ext.length > 0) // Remove empty values
            : undefined,
      })
      .option('exclude', {
        alias: 'e',
        type: 'string',
        describe: 'Comma-separated list of file extensions to exclude (e.g., mp4,exe)',
        coerce: (exclude: string) =>
          exclude
            ? exclude
              .split(',')
              .map((ext) => ext.trim().toLowerCase())
              .filter((ext) => ext.length > 0) // Remove empty values
            : undefined,
      })
      .help()
      .alias('h', 'help')
      .parseSync();

    return {
        directories: (args.directories as string[]).map((dir) => dir.trim()).filter((dir, i, dirs) => dirs.indexOf(dir) === i),
      verbose: args.verbose,
      filter: args.filter,
      exclude: args.exclude,
    };
  }
}
