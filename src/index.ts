import 'dotenv/config'
import { Command } from 'commander';
import packageJson from '../package.json';
import { showMenu } from "./cliUtils/interactive"
import { runAutoMode } from './cliUtils/auto';

import type { OptionsCLI } from "./types"
import { projectNeedsSetup } from './projectUtils/projectSetup';

const program = new Command();
program
  .name('cotext')
  .version(packageJson.version)
  .description('A CLI tool to aggregate codebase files for context generation')
  .option('-c, --custom', 'Use interactive CLI to manage the project', 'auto')
  .action(async (options: OptionsCLI) => {
    try {
      // return if already set up
      const currentDir = process.cwd();
      if (await projectNeedsSetup(currentDir) === false) {
        console.log('Project already setup. Nothing to do.');
        return
      }

      // start INTERACTIVE mode
      if (!options.custom) {
        console.log("Running [CUSTOM] mode!")
        showMenu()
      }

      // start AUTO mode
      console.log("Running [AUTO] mode!")
      await runAutoMode()
      process.exit(0);
    } catch (error: any) {
      console.error(`An error occurred: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
