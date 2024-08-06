import { private_data } from "../../docs/private_data";
import type { LocalRepository } from "@/types";

export function formatPrivateData(): LocalRepository[] {
  return private_data.map(
    (repo) => {
      return {
        name: repo.name,
        description: "",
        visibility: "",

        // links
        html_url: "",
        ssh_url: "",

        // numerics
        size: 2,
        watchers_count: 2,
        stargazers_count: 2,

        // repo state
        fork: true,
        disabled: true,
        archived: true,

        // dates updates
        updated_at: "",
        pushed_at: "",

        // custom
        last_updated: ''
      }
    }
  )
}
