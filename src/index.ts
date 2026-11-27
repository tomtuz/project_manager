import 'dotenv/config'
import path from 'node:path';
import * as fs from 'node:fs/promises';
import { Command } from 'commander';
import packageJson from '../package.json';
import { showMenu } from "./cliUtils/interactive"
import { runAutoMode } from './cliUtils/auto';
import { validateProjectPath } from './utils/pathUtils';
import { pathProvider } from './utils/pathProvider';
import { scanAndDisplayProjects } from './projectUtils/projectScanner';
import { logger, handleError, askQuestion } from './utils/logger';
import {
  initializeConfig,
  ensureConfigExists,
  getConfig,
  updateConfig
} from './utils/configManager';

import { projectNeedsSetup, setupProject } from './projectUtils/projectSetup';

const program = new Command();
program
  .name('Project Folder Manager')
  .version(packageJson.version)
  .description('A CLI tool to manage and analyze projects');

program
  .command('setup')
  .description('Setup a project')
  .option('-p, --path <path>', 'Supply custom project path')
  .option('-m, --manual', 'Use manual setting to force update', false)
  .action(async (options) => {
    try {
      await initializeConfig();

      if (!(await ensureConfigExists())) {
        logger.info("Configuration not found. Setting up configuration.");
        await setupConfiguration();
      }

      const config = await getConfig();

      // Resolve and validate path
      const projectPath = options.path ? path.resolve(options.path) : config.mainProjectFolder;

      if (!await validateProjectPath(projectPath)) {
        logger.error('Invalid project path. Exiting.');
        process.exit(1);
      }

      // Set the validated path in the pathProvider
      pathProvider.setProjectPath(projectPath);

      if (!options.manual && !(await projectNeedsSetup(projectPath))) {
        logger.info('Project already setup. Nothing to do.');
        process.exit(0);
      }

      await setupProject(projectPath);
    } catch (error: any) {
      handleError(error);
      process.exit(1);
    }
  });

program
  .command('scan')
  .description('Scan and display project information')
  .action(async () => {
    try {
      await initializeConfig();

      if (!(await ensureConfigExists())) {
        logger.info("Configuration not found. Setting up configuration.");
        await setupConfiguration();
      }

      await scanAndDisplayProjects();
    } catch (error: any) {
      handleError(error);
      process.exit(1);
    }
  });

program
  .command('interactive')
  .description('Run in interactive mode')
  .action(async () => {
    logger.info("Running [INTERACTIVE] mode!");
    await showMenu();
  });

program
  .command('auto')
  .description('Run in auto mode')
  .option('-p, --path <path>', 'Supply custom project path')
  .action(async (options) => {
    try {
      if (!(await ensureConfigExists())) {
        logger.info("Configuration not found. Setting up configuration.");
        await initializeConfig();
        await setupConfiguration();
      }


      logger.info("Running [AUTO] mode!");
      await runAutoMode(options);
    } catch (error: any) {
      handleError(error);
      process.exit(1);
    }
  });

program.parse(process.argv);

async function validatePath(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function setupConfiguration() {
  const mainProjectFolder = await askQuestion(
    "Projects root path: ",
    validatePath,
    "Invalid path. Please enter a valid directory path."
  );

  const githubApiToken = await askQuestion(
    "GitHub API token (optional, press enter to skip): ",
  );

  await updateConfig({
    mainProjectFolder,
    ...(githubApiToken && { githubApiToken })
  });
}
