import path from 'node:path';

let projectPath: string | null = null;

export const pathProvider = {
  setProjectPath: (newPath: string): void => {
    projectPath = path.resolve(newPath);
  },

  getProjectPath: (): string => {
    if (!projectPath) {
      throw new Error('Project path has not been set. Call setProjectPath first.');
    }
    return projectPath;
  },

  getGithubReposFilePath: (): string => {
    return path.join(pathProvider.getProjectPath(), '.github_repos.json');
  }
};