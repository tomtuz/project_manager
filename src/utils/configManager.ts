import fs from 'node:fs/promises';
import { CONFIG_FOLDER, CONFIG_FILE } from '@/constants';
import { logger } from './logger';

interface Config {
  mainProjectFolder: string;
  githubApiToken?: string;
}

export async function initializeConfig(): Promise<void> {
  try {
    // create configuration folder '/user/.pfm'
    await fs.mkdir(CONFIG_FOLDER, { recursive: true });

    // stat check for cross platform
    const configExists = await fs.stat(CONFIG_FILE).then(
      () => true,
      () => false
    );

    if (!configExists) {
      const defaultConfig: Config = {
        mainProjectFolder: '',
      };
      await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    } else {
      console.warn('Config already exists, not overwriting!');
    }
  } catch (error: any) {
    if (error.code === 'EACCES') {
      console.error('Permission denied. Unable to create or access the config file.');
    } else {
      console.error('Error initializing configuration:', error);
    }
    throw error;
  }
}

export async function getConfig(): Promise<Config> {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading configuration:', error);
    throw error;
  }
}

export async function updateConfig(newConfig: Partial<Config>): Promise<void> {
  try {
    const currentConfig = await getConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    await fs.writeFile(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    logger.info(`Configuration saved at ${CONFIG_FILE}`);
  } catch (error) {
    console.error('Error updating configuration:', error);
    throw error;
  }
}

export async function ensureConfigExists(): Promise<boolean> {
  try {
    await fs.access(CONFIG_FILE);
    return true;
  } catch (error) {
    return false;
  }
}
