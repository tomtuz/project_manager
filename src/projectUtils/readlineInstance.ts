import { createInterface, Interface } from 'node:readline';

let _instance: Interface | null = null;

export const getReadlineSingleton = (): Interface => {
  if (!_instance) {
    _instance = createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  return _instance;
};
