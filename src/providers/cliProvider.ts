import { Command } from "commander";

let _instance: Command | null = null

export const getCliInstance = () => {
  if (!_instance) {
    _instance = new Command();
  }
  return _instance;
};
