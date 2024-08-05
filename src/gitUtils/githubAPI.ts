import { Octokit } from "octokit";
import type { LocalRepository } from "@/types";
import type { OctokitResponse } from "@octokit/types";

// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repositories-for-a-user
async function getRepositories(token: string): Promise<LocalRepository[]> {
  const octokit = new Octokit({ auth: token });
  try {
    const { data }: OctokitResponse<any> = await octokit.rest.repos.listForAuthenticatedUser({
      visibility: 'all',
      sort: 'updated',
      per_page: 100,
      repo: true
    });
    console.log("response data: ", data)
    return data.repos || [];
  } catch (error) {
    console.error("Error fetching repositories:", (error as Error).message);

    // throw error;
    // try not to break
    return []
  }
}

export const octoAPI = { getRepositories };
