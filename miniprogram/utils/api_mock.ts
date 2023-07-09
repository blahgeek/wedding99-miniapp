import { GlobalConfig } from './api';

async function returnAfter<T>(value: T, ms: number): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
};

export async function getMockGlobalConfig(): Promise<GlobalConfig> {
  return returnAfter({
    uiConfig: {},
    huntQuestions: {},
  }, 500);
};
