import { scanAndDisplayProjects } from '../projectUtils/projectScanner';
import { setupProject, projectNeedsSetup } from '../projectUtils/projectSetup';
import { getConfig } from '../utils/configManager';
import { logger, handleError, askQuestion } from '../utils/logger';
import path from 'node:path';

export async function showMenu(): Promise<void> {
  while (true) {
    logger.info('\n--- Project Folder Manager ---');
    logger.info('1. Scan Projects');
    logger.info('2. Setup Project');
    logger.info('3. Exit');

    const choice = await askQuestion('Enter your choice (1-3): ');

    switch (choice) {
      case '1':
        await scanProjects();
        break;
      case '2':
        await setupProjectInteractive();
        break;
      case '3':
        logger.info('Exiting...');
        return;
      default:
        logger.warn('Invalid choice. Please try again.');
    }
  }
}

async function scanProjects(): Promise<void> {
  try {
    logger.info('\nScanning projects...');
    await scanAndDisplayProjects();
  } catch (error: any) {
    handleError(error);
  }
}

async function setupProjectInteractive(): Promise<void> {
  try {
    const config = await getConfig();
    let projectPath = config.mainProjectFolder;

    const useCustomPath = await askQuestion('Do you want to use a custom project path? (y/N): ');
    if (useCustomPath.toLowerCase() === 'y') {
      projectPath = await askQuestion('Enter the project path: ');
      projectPath = path.resolve(projectPath);
    }

    logger.info(`Checking project: ${projectPath}`);
    if (await projectNeedsSetup(projectPath)) {
      logger.info('Project needs setup. Running setup...');
      await setupProject(projectPath);
    } else {
      const forceSetup = await askQuestion('Project is already set up. Do you want to force setup? (y/N): ');
      if (forceSetup.toLowerCase() === 'y') {
        await setupProject(projectPath);
      } else {
        logger.info('Setup skipped.');
      }
    }
  } catch (error: any) {
    handleError(error);
  }
}
