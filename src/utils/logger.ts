// import { getReadlineSingleton } from '@/projectUtils/readlineInstance';
import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';

const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'app.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const logger = {
  info: (message: string) => log('INFO', message),
  warn: (message: string) => log('WARN', message),
  error: (message: string) => log('ERROR', message),
  debug: (message: string) => log('DEBUG', message),
};

function log(level: string, message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} [${level}] ${message}\n`;

  fs.appendFileSync(logFile, logMessage);
  console.log(logMessage.trim());
}

export function handleError(error: Error): void {
  logger.error(`An error occurred: ${error.message}`);
  logger.debug(`Stack trace: ${error.stack}`);
}

type Validator = (input: string) => Promise<boolean> | boolean;

export async function askQuestion(
  question: string,
  validator: Validator = async () => true,
  errorMessage = "Invalid input. Please try again."
): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    const answer = await new Promise<string>(resolve => {
      rl.question(question, resolve);
    });

    const isValid = await validator(answer);
    if (isValid) {
      rl.close();
      return answer;
    }

    logger.error(errorMessage);
  }
}
