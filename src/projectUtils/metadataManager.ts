import { promises as fs } from 'node:fs';
import path from 'node:path';

interface ProjectMetadata {
  repositoryUrl: string;
  lastUpdateTime: string;
}

const METADATA_FOLDER = '.docs';
const METADATA_FILE = 'project_metadata.json';

export async function saveMetadata(projectPath: string, metadata: ProjectMetadata): Promise<void> {
  const metadataFolderPath = path.join(projectPath, METADATA_FOLDER);
  const metadataFilePath = path.join(metadataFolderPath, METADATA_FILE);

  try {
    await fs.mkdir(metadataFolderPath, { recursive: true });
    await fs.writeFile(metadataFilePath, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Error saving metadata:', error);
    throw error;
  }
}

export async function getMetadata(projectPath: string): Promise<ProjectMetadata | null> {
  const metadataFilePath = path.join(projectPath, METADATA_FOLDER, METADATA_FILE);

  try {
    const data = await fs.readFile(metadataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    console.error('Error reading metadata:', error);
    throw error;
  }
}

export async function updateMetadata(projectPath: string, updates: Partial<ProjectMetadata>): Promise<void> {
  const currentMetadata = await getMetadata(projectPath) || {};
  const updatedMetadata = {
    ...currentMetadata,
    ...updates,
    lastUpdateTime: new Date().toISOString()
  };
  await saveMetadata(projectPath, updatedMetadata as ProjectMetadata);
}
