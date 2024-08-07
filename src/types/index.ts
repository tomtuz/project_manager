// CLI input options
export interface OptionsCLI {
  custom: boolean
  auto: boolean
  manual: boolean
  path: string
}

// Individual repository format
export interface LocalRepository {
  name: string,           // "extension-filters"
  description: string | null
  visibility: "public" | "private" | string,

  // links
  html_url: string,       // `https://github.com/${user/repo-name}`,
  ssh_url: string         // `git@github.com:{user/repo-name}.git`,

  // numerics
  size: number,
  watchers_count: number
  stargazers_count: number

  // repo state
  fork: boolean,
  disabled: boolean,
  archived: boolean,

  // dates updates
  updated_at: string,     // "2024-08-04T01:01:41Z",
  pushed_at: string,      // "2024-08-04T01:01:38Z",

  // custom
  last_updated: string,    // (Custom) ISO Date string
}

export interface RepoDisplay {
  name: string;
  url: string;
  last_updated: string;    // Date ISO string
}

// Repository Parent object
export interface IndexLocalRepository {
  last_updated: string, // ISO string
  repo_list: LocalRepository[];
}
