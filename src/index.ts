import 'dotenv/config'
import path from 'node:path';
import { Command } from 'commander';
import packageJson from '../package.json';
import { showMenu } from "./cliUtils/interactive"
import { runAutoMode } from './cliUtils/auto';
import { validateProjectPath } from './utils/pathUtils';
import { pathProvider } from './utils/pathProvider';

import type { OptionsCLI } from "./types"
import { projectNeedsSetup } from './projectUtils/projectSetup';

const program = new Command();
program
  .name('Project Folder Manager')
  .version(packageJson.version)
  .description('A CLI tool to aggregate codebase files for context generation')
  .option('-c, --custom', 'Use interactive CLI to manage the project', 'auto')
  .option('-a, --auto', 'Use auto mode to manage the project', 'auto')
  .option('-m, --manual', 'Use manual setting to force update', false)
  .option('-p, --path <path>', 'Supply custom project path', process.cwd())
  .action(async (options: OptionsCLI) => {
    try {
      // Resolve and validate path early
      const projectPath = path.resolve(options.path);

      if (!await validateProjectPath(projectPath)) {
        console.error('Invalid project path. Exiting.');
        process.exit(1);
      }

      // Set the validated path in the pathProvider
      pathProvider.setProjectPath(projectPath);

      if (!options.manual) {
        // Use the validated project path for setup check
        if (await projectNeedsSetup(projectPath) === false) {
          console.log('Project already setup. Nothing to do.');
          process.exit(0)
        }
      }

      // start AUTO mode
      if (options.auto) {
        console.log("Running [AUTO] mode!")
        await runAutoMode()
        process.exit(0)
      }

      // start INTERACTIVE mode
      if (options.custom) {
        console.log("Running [CUSTOM] mode!")
        showMenu()
        process.exit(0)
      }

      process.exit(0);
    } catch (error: any) {
      console.error(`An error occurred: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
