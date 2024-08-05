import path from 'node:path';
import { promises as fs } from 'node:fs';

import type { IndexLocalRepository, LocalRepository } from '@/types';
import { ConfigFileAccessError } from '@/errors/ConfigurationErrors';

const REPOS_FILE = path.join(
  // process.env.HOME ||
  // process.env.USERPROFILE ||
  // process.cwd(),
  "C:/Users/tto/Desktop/sfs",
  '.github_repos.json'
);

/*
--------
1. [TOKEN]
2. [FORMAT]
3. [WRITE]
4. [READ]
5. [MATCH]
6. [MATCH]
*/


// [TOKEN] 
export function getGitHubToken(): string {
  // TODO: better way than .env, i.e. github cli session
  const token = process.env.GITHUB_TOKEN || null;
  console.log("token: ", token)

  if (!token) {
    throw new Error('GitHub token not found. Please set the GITHUB_TOKEN environment variable.');
  }
  return token;
}

// [FORMAT]
export function formatData(repoArr: LocalRepository[]) {
  return repoArr.map((repo: any) => ({
    name: repo.name,
    url: repo.html_url,
    lastUpdated: repo.updated_at,
  }));
}

// [WRITE]
export async function writeToFile(repoObj: IndexLocalRepository) {
  console.log("Writing to file...")
  try {
    await fs.writeFile(REPOS_FILE, JSON.stringify(repoObj, null, 2), 'utf-8');
    console.log('Repositories file updated successfully.');
  } catch (error) {
    console.error('Error updating repositories file:', error);
    throw error;
  }
}

// TODO: move to smaller utils
export async function isFileReadable(filename: string): Promise<boolean> {
  console.log("Checking file access...")
  console.log("Dir: ", filename)
  try {
    // Check if current process has read permission to the file
    await fs.access(filename, fs.constants.R_OK)

    return true
  } catch (error) {
    throw new ConfigFileAccessError(filename, error as Error);
  }
}

// [READ]
export async function readRepositories(): Promise<IndexLocalRepository | null> {
  try {
    if (!await isFileReadable(REPOS_FILE)) {
      return null;
    }

    const repoObj = await fs.readFile(REPOS_FILE, 'utf-8');
    return JSON.parse(repoObj);
  } catch (error) {
    console.error('Error reading repositories file:', error);
    return null;
  }
}

// [MATCH]
export const updateRepoData = async (repoName: string, commitDate: string): Promise<void> => {
  const repoObj = await readRepositories();
  if (!repoObj) {
    return
  }

  const repo = repoObj.repo_list.find((r) => r.name === repoName);
  if (repo) {
    repo.last_updated = commitDate;
    await writeToFile(repoObj)
  }
};

// [MATCH]
export async function findMatchingRepositories(projectName: string): Promise<LocalRepository[]> {
  const repoObj = await readRepositories();
  const normalizedProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (repoObj) {
    return repoObj.repo_list.filter((repo: any) => {
      const normalizedRepoName = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedRepoName.includes(normalizedProjectName) || normalizedProjectName.includes(normalizedRepoName);
    }) || [];
  }

  return []
}
