import { private_data } from "../../docs/private_data";
import type { LocalRepository } from "@/types";

export function formatPrivateData(): LocalRepository[] {
  return private_data.map(
    (repo) => {
      return {
        name: repo.name,
        description: repo.description,
        visibility: repo.visibility,

        // links
        html_url: repo.html_url,
        ssh_url: repo.ssh_url,

        // numerics
        size: repo.size,
        watchers_count: repo.watchers_count,
        stargazers_count: repo.stargazers_count,

        // repo state
        fork: repo.fork,
        disabled: repo.disabled,
        archived: repo.archived,

        // dates updates
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,

        // custom
        last_updated: new Date().toISOString()
      }
    }
  )
}
