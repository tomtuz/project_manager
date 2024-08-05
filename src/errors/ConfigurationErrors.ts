export class ConfigFileAccessError extends Error {
  constructor(path: string, originalError: Error) {
    super(`E1: Cannot access config file at path: ${path}. ${originalError.message}`);
    this.name = 'ConfigFileAccessError';
  }
}
