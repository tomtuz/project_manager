import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import { Octokit } from 'octokit';

const REPOS_FILE = path.join(os.homedir(), '.github_repos.json');

interface Repository {
  name: string;
  url: string;
  lastUpdated: string;
}

async function getGitHubToken(): Promise<string> {
  // TODO: better way than .env, i.e. github cli session
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GitHub token not found. Please set the GITHUB_TOKEN environment variable.');
  }
  return token;
}

export async function updateRepositoriesFile(): Promise<void> {
  const token = await getGitHubToken();
  const octokit = new Octokit({ auth: token });

  try {
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      visibility: 'all',
      sort: 'updated',
      per_page: 100,
    });

    const repositories: Repository[] = repos.map((repo: any) => ({
      name: repo.name,
      url: repo.html_url,
      lastUpdated: repo.updated_at,
    }));

    await fs.writeFile(REPOS_FILE, JSON.stringify(repositories, null, 2));
    console.log('Repositories file updated successfully.');
  } catch (error) {
    console.error('Error updating repositories file:', error);
    throw error;
  }
}

export async function getRepositories(): Promise<Repository[]> {
  try {
    const data = await fs.readFile(REPOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading repositories file:', error);
    return [];
  }
}

export async function findMatchingRepositories(projectName: string): Promise<Repository[]> {
  const repositories = await getRepositories();
  const normalizedProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');

  return repositories.filter(repo => {
    const normalizedRepoName = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalizedRepoName.includes(normalizedProjectName) || normalizedProjectName.includes(normalizedRepoName);
  });
}

export async function refreshRepositories(): Promise<void> {
  console.log('Refreshing repositories...');
  await updateRepositoriesFile();
  console.log('Repositories refreshed successfully.');
}
