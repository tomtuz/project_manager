import { setupProject, projectNeedsSetup } from '../projectUtils/projectSetup';
import { logger, handleError } from '../utils/logger';
import path from 'node:path';

interface AutoOptions {
  path?: string;
}

export async function runAutoMode(options: AutoOptions): Promise<void> {
  try {
    const localProjectPath = options.path ? path.resolve(options.path) : process.cwd();
    logger.info(`Checking project: ${localProjectPath}`);

    if (await projectNeedsSetup(localProjectPath)) {
      logger.info('Project needs setup. Running setup...');
      await setupProject(localProjectPath);
    } else {
      logger.info('Project is already set up.');
    }

    logger.info('Auto mode completed successfully.');
  } catch (error: any) {
    handleError(error);
    throw error;
  }
}
