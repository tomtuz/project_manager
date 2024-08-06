import fs from 'node:fs/promises';
import path from 'node:path';

export async function isFileReadable(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export async function validateProjectPath(projectPath: string): Promise<boolean> {
  try {
    await fs.access(projectPath);
  } catch (err) {
    console.warn(`The specified path does not exist or is not accessible: ${projectPath}`);
    return false;
  }

  const githubReposFile = path.join(projectPath, '.github_repos.json');
  if (!(await isFileReadable(githubReposFile))) {
    console.warn(`The .github_repos.json file is not readable in the specified path: ${projectPath}`);
    return false;
  }

  return true;
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw err;
    }
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Error reading JSON file: ${(err as Error).message}`);
  }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    await ensureDirectoryExists(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    throw new Error(`Error writing JSON file: ${(err as Error).message}`);
  }
}
