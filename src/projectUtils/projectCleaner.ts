import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getReadlineSingleton } from '../projectUtils/readlineInstance';

const rl = getReadlineSingleton();

/**
 * Recursively deletes a directory and its contents
 * @param {string} dirPath The path of the directory to delete
 */
async function deleteDirectory(dirPath: string): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await deleteDirectory(fullPath);
      } else {
        await fs.unlink(fullPath);
      }
    }

    await fs.rmdir(dirPath);
  } catch (error) {
    console.error(`Error deleting directory ${dirPath}:`, error);
    throw error;
  }
}

/**
 * Cleans the project by deleting node_modules and .git folders
 * @param {string} projectPath The path of the project to clean
 */
export async function cleanProject(projectPath: string): Promise<void> {
  const foldersToDelete = ['node_modules', '.git'];

  for (const folder of foldersToDelete) {
    const folderPath = path.join(projectPath, folder);
    try {
      await fs.access(folderPath);
      rl.question(
        "Are you sure? About to delete 'node_modules' and '.git' folders? 'Yy/Nn': ",
        async (answer: string) => {
          if (answer.toLowerCase() === 'n') {
            console.log(`Deleting ${folder} folder...`);
            await deleteDirectory(folderPath);
            console.log(`${folder} folder deleted successfully.`);
          }
        }
      )
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log(`${folder} folder not found. Skipping.`);
      } else {
        console.error(`Error deleting ${folder} folder:`, error);
      }
    }
  }
}
