import { syncIfNeeded } from "@/gitUtils/sync";

export async function runAutoMode() {
  const repos = await syncIfNeeded();
  console.log(`repos(${repos.length}):`);
  console.log(repos);
  console.log("Finished syncing!");
}
