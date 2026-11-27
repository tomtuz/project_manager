import fs from 'node:fs/promises';
import path from 'node:path';
import { getConfig } from '../utils/configManager';
import { analyzeProject } from './projectSetup';
import { logger, handleError } from '../utils/logger';

interface ProjectSummary {
  name: string;
  path: string;
  type: string;
  hasGit: boolean;
  hasDependencies: boolean;
  githubRepoName?: string;
}

export async function scanProjects(): Promise<ProjectSummary[]> {
  const config = await getConfig();
  const mainProjectFolder = config.mainProjectFolder;

  if (!mainProjectFolder) {
    throw new Error('Main project folder not set in configuration');
  }

  const projects: ProjectSummary[] = [];

  try {
    const entries = await fs.readdir(mainProjectFolder, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(mainProjectFolder, entry.name);
        const projectInfo = await analyzeProject(projectPath);

        projects.push({
          name: entry.name,
          path: projectPath,
          ...projectInfo
        });
      }
    }
  } catch (error: any) {
    handleError(error);
  }

  return projects;
}

export async function displayProjectSummary(projects: ProjectSummary[]): Promise<void> {
  logger.info('Project Summary:');
  logger.info('================');

  for (const project of projects) {
    logger.info(`Name: ${project.name}`);
    logger.info(`Path: ${project.path}`);
    logger.info(`Type: ${project.type}`);
    logger.info(`Git: ${project.hasGit ? 'Initialized' : 'Not initialized'}`);
    logger.info(`Dependencies: ${project.hasDependencies ? 'Installed' : 'Not installed'}`);
    logger.info(`GitHub Repo: ${project.githubRepoName || 'Not linked'}`);
    logger.info('----------------');
  }
}

export async function scanAndDisplayProjects(): Promise<void> {
  try {
    const projects = await scanProjects();
    await displayProjectSummary(projects);
  } catch (error: any) {
    handleError(error);
  }
}
