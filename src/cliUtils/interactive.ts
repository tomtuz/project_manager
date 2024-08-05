/**
 * Project Folder Manager
 * 
 * This tool helps manage project folders by providing functionality to:
 * 1. Initialize projects and link them to GitHub repositories
 * 2. Clean projects by deleting node_modules and .git folders
 * 3. Refresh the list of GitHub repositories
 * 4. Set up projects by cloning repositories and installing dependencies
 * 
 * The tool uses a command-line interface for user interaction.
 */

import { initializeProject } from '../projectUtils/projectInitializer';
import { cleanProject } from '../projectUtils/projectCleaner';
import { syncManually } from '../gitUtils/sync';
import { setupProject } from '../projectUtils/projectSetup';
import { getReadlineSingleton } from '../projectUtils/readlineInstance';

const rl = getReadlineSingleton();

/**
 * Prompts the user to choose an action from the available options.
 * @returns {Promise<string>} The user's choice as a string.
 */
async function promptUser(): Promise<string> {
  const prompts = [
    'Choose an action',
    '1. Initialize project',
    '2. Clean project',
    '3. Refresh repositories',
    '4. Set up project',
    '5. Exit',
    'Enter the number of your choice:'
  ]

  return new Promise((resolve) => {
    rl.question(prompts.join('\n'), (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * The main function that runs the Project Folder Manager tool.
 * It presents a menu to the user and executes the chosen action.
 */
export async function showMenu() {
  console.log('-- Project Folder Manager --');

  while (true) {
    const choice = await promptUser();

    switch (choice) {
      case '1':
        try {
          await initializeProject();
        } catch (error) {
          console.error('An error occurred during project initialization:', error);
        }
        break;
      case '2':
        try {
          await cleanProject(process.cwd());
        } catch (error) {
          console.error('An error occurred during project cleaning:', error);
        }
        break;
      case '3':
        try {
          await syncManually();
        } catch (error) {
          console.error('An error occurred while refreshing repositories:', error);
        }
        break;
      case '4':
        try {
          await setupProject(process.cwd());
        } catch (error) {
          console.error('An error occurred during project setup:', error);
        }
        break;
      case '5':
        console.log('Exiting Project Folder Manager. Goodbye!');
        rl.close();
        return;
      default:
        console.log('Invalid choice. Please try again.');
    }
  }
}
