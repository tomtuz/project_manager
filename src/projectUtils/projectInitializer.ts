import path from 'node:path';
import { promises as fs } from 'node:fs';
import { findMatchingRepositories } from '../gitUtils/processData';
import { syncIfNeeded, syncManually } from '../gitUtils/sync';

import { saveMetadata, getMetadata } from './metadataManager';
import { getReadlineSingleton } from '../projectUtils/readlineInstance';

const rl = getReadlineSingleton();

/**
 * Attempts to get the project name from package.json, or uses the folder name as a fallback.
 * @returns {Promise<string>} The project name.
 */
async function getProjectName(): Promise<string> {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    return packageJson.name;
  } catch (error) {
    // If package.json doesn't exist or can't be read, use the folder name
    return path.basename(process.cwd()).replace(/[^a-zA-Z0-9]/g, '');
  }
}

/**
 * Presents the user with a list of matching repositories and prompts for selection.
 * @param {any[]} matches - An array of matching repositories.
 * @returns {Promise<string | null>} The selected repository URL, 'refresh' to refresh the list, or null if cancelled.
 */
async function selectRepository(matches: any[]): Promise<string | null> {
  if (matches.length === 0) {
    console.log('No matching repositories found.');
    return null;
  }

  console.log('Matching repositories:');
  matches.forEach((repo, index) => {
    console.log(`${index + 1}. ${repo.name} (${repo.url})`);
  });

  return new Promise((resolve) => {
    rl.question('Enter the number of your choice (or "r" to refresh repositories, "c" to cancel): ', (answer) => {
      if (answer.toLowerCase() === 'r') {
        resolve('refresh');
      } else if (answer.toLowerCase() === 'c') {
        resolve(null);
      } else {
        const index = Number.parseInt(answer) - 1;
        if (index >= 0 && index < matches.length) {
          resolve(matches[index].url);
        } else {
          console.log('Invalid choice. Please try again.');
          resolve(null);
        }
      }
    });
  });
}

/**
 * Initializes a project by linking it to a GitHub repository.
 * This function guides the user through the process of selecting a repository
 * and saves the project metadata.
 */
export async function initializeProject(): Promise<void> {
  const projectName = await getProjectName();
  console.log(`Initializing project: ${projectName}`);

  const existingMetadata = await getMetadata(process.cwd());
  if (existingMetadata) {
    console.log('Project already initialized. Metadata:', existingMetadata);
    return;
  }

  while (true) {
    await syncIfNeeded();
    const matches = await findMatchingRepositories(projectName);
    const selectedRepoUrl = await selectRepository(matches);

    if (selectedRepoUrl === 'refresh') {
      await syncManually();
      continue;
    }

    if (selectedRepoUrl) {
      await saveMetadata(process.cwd(), {
        repositoryUrl: selectedRepoUrl,
        lastUpdateTime: new Date().toISOString(),
      });
      console.log('Project initialized successfully.');
      rl.close();
      return;
    }

    console.log('Project initialization cancelled.');
    rl.close();
    return;
  }
}
