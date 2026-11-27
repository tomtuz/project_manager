import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { getMetadata, updateMetadata } from './metadataManager';
import { getConfig } from '../utils/configManager';
import { Octokit } from 'octokit';
import { logger, handleError } from '../utils/logger';

export interface ProjectInfo {
  type: string;
  hasGit: boolean;
  hasDependencies: boolean;
  githubRepoName?: string;
}

export async function setupProject(projectPath: string): Promise<void> {
  try {
    const projectInfo = await analyzeProject(projectPath);
    logger.info(`Project analysis: ${projectInfo}`);

    await setupGitRepository(projectPath, projectInfo);
    await setupDependencies(projectPath, projectInfo);
    await updateGitHubData(projectPath, projectInfo);

    logger.info('Project setup completed successfully.');
  } catch (error: any) {
    handleError(error);
    throw error;
  }
}

const accessPath = async (pathName: string) => {
  return fs.access(pathName)
    .then(() => true)
    .catch(() => false)
}

export async function analyzeProject(projectPath: string): Promise<ProjectInfo> {
  const projectInfo: ProjectInfo = {
    type: 'unknown',
    hasGit: false,
    hasDependencies: false,
  };

  // Check for .git folder
  const gitFolderPath = path.join(projectPath, '.git');
  projectInfo.hasGit = await accessPath(gitFolderPath)

  // Determine project type and check for dependencies
  const packageJsonPath = path.join(projectPath, 'package.json');
  const goModPath = path.join(projectPath, 'go.mod');

  // TODO: make a switch statement for project types defined in configuration
  if (await accessPath(packageJsonPath)) {
    projectInfo.type = 'Node.js';
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    projectInfo.hasDependencies = await accessPath(nodeModulesPath);
  } else if (await accessPath(goModPath)) {
    projectInfo.type = 'Golang';
    // For Go projects, we consider it has dependencies if go.mod exists
    projectInfo.hasDependencies = true;
  }

  // Try to match with GitHub repo data
  const metadata = await getMetadata(projectPath);
  if (metadata?.repositoryUrl) {
    const repoName = metadata.repositoryUrl.split('/').pop()?.replace('.git', '');
    if (repoName) {
      projectInfo.githubRepoName = repoName;
    }
  }

  return projectInfo;
}

async function setupGitRepository(projectPath: string, projectInfo: ProjectInfo): Promise<void> {
  if (!projectInfo.hasGit) {
    logger.info('Initializing Git repository...');
    execSync('git init', { stdio: 'inherit', cwd: projectPath });

    // Create .gitignore file if it doesn't exist
    const gitignorePath = path.join(projectPath, '.gitignore');
    if (!(await fs.access(gitignorePath).then(() => true).catch(() => false))) {
      const gitignoreContent = projectInfo.type === 'Node.js' ? 'node_modules/\n' : '';
      await fs.writeFile(gitignorePath, gitignoreContent);
    }
  } else {
    logger.info('Git repository already initialized.');
  }
}

async function setupDependencies(projectPath: string, projectInfo: ProjectInfo): Promise<void> {
  if (!projectInfo.hasDependencies) {
    if (projectInfo.type === 'Node.js') {
      logger.info('Installing Node.js dependencies...');
      execSync('pnpm install', { stdio: 'inherit', cwd: projectPath });
    } else if (projectInfo.type === 'Golang') {
      logger.info('Downloading Go dependencies...');
      execSync('go mod download', { stdio: 'inherit', cwd: projectPath });
    } else {
      logger.warn('Unknown project type. Skipping dependency installation.');
    }
  } else {
    logger.info('Dependencies are already installed.');
  }
}

async function updateGitHubData(projectPath: string, projectInfo: ProjectInfo): Promise<void> {
  const config = await getConfig();
  if (!config.githubApiToken) {
    logger.warn('GitHub API token not found in configuration. Skipping GitHub data update.');
    return;
  }

  const octokit = new Octokit({ auth: config.githubApiToken });

  if (projectInfo.githubRepoName) {
    try {
      const [owner, repo] = projectInfo.githubRepoName.split('/');
      const { data } = await octokit.rest.repos.get({ owner, repo });

      await updateMetadata(projectPath, {
        repositoryUrl: data.html_url,
        lastUpdateTime: new Date().toISOString(),
        description: data.description || '',
        stars: data.stargazers_count,
        forks: data.forks_count,
      });

      logger.info('GitHub repository data updated successfully.');
    } catch (error: any) {
      handleError(error);
    }
  } else {
    logger.info('No matching GitHub repository found. Adding project with localhost link.');
    await updateMetadata(projectPath, {
      repositoryUrl: `http://localhost/${path.basename(projectPath)}`,
      lastUpdateTime: new Date().toISOString(),
      description: 'Local project',
      stars: 0,
      forks: 0,
    });

    // interface ProjectMetadata {
    //   repositoryUrl: string;
    //   lastUpdateTime: string;
    // }
  }
}

export async function projectNeedsSetup(projectPath: string): Promise<boolean> {
  const projectInfo = await analyzeProject(projectPath);
  return !projectInfo.hasGit || !projectInfo.hasDependencies;
}
