import path from "node:path";
import os from "node:os";

// cross platform global paths
export const CONFIG_FOLDER = path.join(os.homedir(), '.pfm');
export const CONFIG_FILE = path.join(CONFIG_FOLDER, 'config.json');
