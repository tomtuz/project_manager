import { syncIfNeeded } from "@/gitUtils/sync";
import type { OptionsCLI } from "@/types"

export async function runAutoMode(options: OptionsCLI) {
  const repos = await syncIfNeeded(options);
  console.log(`repos(${repos.length}):`);
  console.log(repos);
  console.log("Finished syncing!");
}
