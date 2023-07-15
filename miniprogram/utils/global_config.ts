import { z } from 'zod';

import { HuntTaskSchema } from '../pages/hunt/types';
import { request } from './request';

const DEBUG = true;

const GlobalConfigSchema = z.object({
  uiConfig: z.record(z.string()),
  huntTasks: z.array(HuntTaskSchema),
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

async function returnAfter<T>(value: T, ms: number): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
};

const MOCK_GLOBAL_CONFIG: GlobalConfig = {
  uiConfig: {},
  huntTasks: [
    {
      id: 'q0',
      defaultLocked: true,
      taskDetail: {
        type: 'question',
        questionRichContent: '<h1>Question 1</h1>',
        answers: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation 1',
      }
    },
    {
      id: 'q1',
      defaultLocked: false,
      taskDetail: {
        type: 'question',
        questionRichContent: '<h1>Question 2</h1>',
        answers: ['A', 'B', 'C', 'D'],
        correctAnswer: 1,
        explanation: 'Explanation 2',
      }
    },
    {
      id: 'q2',
      defaultLocked: false,
      taskDetail: {
        type: 'photo',
        descriptionRichContent: '<h1>Take a photo</h1>',
        requiredFaceCount: 1,
        requiredUniqueFaceCount: 1,
      },
    },
    {
      id: 'q3',
      defaultLocked: false,
      taskDetail: {
        type: 'photo',
        descriptionRichContent: '<h1>Take a photo with two people</h1>',
        requiredFaceCount: 2,
        requiredUniqueFaceCount: 1,
      },
    },
  ],
};

export async function getGlobalConfig(): Promise<GlobalConfig> {
  if (DEBUG) {
    return await returnAfter(MOCK_GLOBAL_CONFIG, 500);
  }

  const { data, statusCode } = await request('/api/global_config');
  if (statusCode !== 200) {
    throw new Error(`getGlobalConfig failed: ${statusCode}`);
  }

  return GlobalConfigSchema.parse(data);
}
