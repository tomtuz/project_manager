import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { getMetadata } from './metadataManager';

/**
 * Sets up the project by checking out the repository and installing dependencies
 * @param {string} projectPath The path of the project to set up
 */
export async function setupProject(projectPath: string): Promise<void> {
  const metadata = await getMetadata(projectPath);

  if (!metadata) {
    console.log('Project metadata not found. Please initialize the project first.');
    return;
  }

  console.log('Setting up project...');

  // Check if .git folder exists
  const gitFolderPath = path.join(projectPath, '.git');
  try {
    await fs.access(gitFolderPath);
    console.log('.git folder already exists. Skipping git clone.');
  } catch (error) {
    // .git folder doesn't exist, clone the repository
    console.log('Cloning repository...');
    execSync(`git clone ${metadata.repositoryUrl} .`, { stdio: 'inherit', cwd: projectPath });
  }

  // Check if node_modules folder exists
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  try {
    await fs.access(nodeModulesPath);
    console.log('node_modules folder already exists. Skipping dependency installation.');
  } catch (error) {
    // node_modules folder doesn't exist, install dependencies
    console.log('Installing dependencies...');
    execSync('pnpm install', { stdio: 'inherit', cwd: projectPath });
  }

  console.log('Project setup completed successfully.');
}

/**
 * Checks if the project needs setup by verifying the existence of .git and node_modules folders
 * @param {string} projectPath The path of the project to check
 * @returns {Promise<boolean>} True if the project needs setup, false otherwise
 */
export async function projectNeedsSetup(projectPath: string): Promise<boolean> {
  const gitFolderPath = path.join(projectPath, '.git');
  const nodeModulesPath = path.join(projectPath, 'node_modules');

  try {
    await fs.access(gitFolderPath);
    await fs.access(nodeModulesPath);
    return false;
  } catch (error) {
    return true;
  }
}
