import path from "node:path";
import util from "node:util";
import { exec } from "node:child_process";
import { octoAPI } from "./githubAPI";
import { getGitHubToken, readRepositories, writeToFile } from "./processData";

import type { IndexLocalRepository, LocalRepository } from "@/types";
import { formatPrivateData } from "@/scripts/test";

const execAsync = util.promisify(exec);
const hookScript = path.join(import.meta.url, "post-commit-hook.ps1");

// [MAIN] AUTO sync
export const syncIfNeeded = async (): Promise<LocalRepository[]> => {
  const repoObj = await readRepositories();
  if (!repoObj) {
    return []
  }

  // IF older than a week
  const lastSyncDate = new Date(repoObj.last_updated);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  if (lastSyncDate < oneWeekAgo) {
    console.log("Last full sync was more than a week ago. Resyncing...");

    const token = getGitHubToken();
    if (!token) {
      return []
    }

    const debug = false;
    const repo_list = debug ? formatPrivateData() : await octoAPI.getRepositories(token);
    console.log("getRepos: ", repo_list)

    // update parent update date
    await writeToFile({
      last_updated: new Date().toISOString(),
      repo_list: repo_list
    });

    // run git commit hook
    // await setupHooks(repos);
    return repo_list;
  }

  console.log("Using repo cache. Last full sync:", repoObj.last_updated);
  return repoObj.repo_list;
};

// [MAIN] MANUAL sync
export async function syncManually(): Promise<void> {
  console.log('Syncing repositories manually...');

  const token = getGitHubToken();
  const repositoryArr = await octoAPI.getRepositories(token);
  if (!repositoryArr) {
    console.log("Repositories are null! They shouldn't be");
  }

  // 1. format data
  const formattedRepo: IndexLocalRepository = {
    last_updated: new Date().toISOString(),
    repo_list: repositoryArr
  }

  // 2. Write RepositoryObj
  writeToFile(formattedRepo)
  console.log('Repositories refreshed successfully.');
}

// TODO: no longer needed?
// run git commit hook to update repo 
// @ts-ignore
const setupHooks = async (repos: LocalRepository[]): Promise<void> => {
  for (const repo of repos) {
    try {
      const localPath = path.join(
        process.env.HOME ||
        process.env.USERPROFILE ||
        "",
        "github",
        repo.name
      );

      const pathCommand = `cd "${localPath}"`
      const gitCommand = "git config core.hooksPath .git/hooks"
      const checkCommand = "if (!(Test-Path .git/hooks)) { New-Item -ItemType Directory -Force -Path .git/hooks }"
      const copyCommand = `Copy-Item "${hookScript}" -Destination .git/hooks/post-commit -Force`

      const hook_command = [
        pathCommand,
        gitCommand,
        checkCommand,
        copyCommand
      ].join(" && ")

      console.log("hook_command: ", hook_command);

      // run hook
      await execAsync(hook_command);
      console.log(`Hook set up for ${repo.name}`);
    } catch (error) {
      console.error(`Error setting up hook for ${repo.name}:`, (error as Error).message);
    }
  }
};

