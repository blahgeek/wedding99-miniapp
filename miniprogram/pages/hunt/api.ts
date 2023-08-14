import 'miniprogram-api-typings';
import { z } from 'zod';

import { request, returnAfter, API_BASEURL } from '../../utils/request';
import { HuntTasksSchema, HuntTasks } from './types';

export async function submitHuntScore(openid: string, name: string, score: number): Promise<void> {
  const { statusCode } = await request(`/api/hunt_score?openid=${openid}`, { name, score }, 'POST');
  if (statusCode !== 200) {
    throw new Error(`postHuntScore failed: ${statusCode}`);
  }
}

export const UploadAndDetectResultSchema = z.object({
  faces: z.array(z.string()),
  url: z.string(),
});

export type UploadAndDetectResult = z.infer<typeof UploadAndDetectResultSchema>;

export async function uploadImageAndDetect(imageFilepath: string): Promise<UploadAndDetectResult> {
  const response = await new Promise<WechatMiniprogram.UploadFileSuccessCallbackResult>((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASEURL}/api/face_upload_and_detect`,
      filePath: imageFilepath,
      name: 'image',
      success: data => resolve(data),
      fail: err => reject(`uploadImageAndDetect failed: ${err.errMsg}`),
    });
  });
  if (response.statusCode !== 200) {
    throw new Error(`uploadImageAndDetect failed: ${response.statusCode}`);
  }
  return UploadAndDetectResultSchema.parse(JSON.parse(response.data));
};


const MOCK_TASKS: HuntTasks = [
  {
    id: 'q0',
    defaultLocked: true,
    taskDetail: {
      type: 'question',
      questionRichContent: '<h1>Question 1</h1>',
      answers: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      explanation: 'Explanation 1',
      removeAnswersAfterAd: [],
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
      removeAnswersAfterAd: [2, 3],
    }
  },
  {
    id: 'q2',
    defaultLocked: false,
    taskDetail: {
      type: 'photo',
      descriptionRichContent: '<h1>Take a photo</h1>',
      successExplanation: 'success explanation',
      requiredFaceCount: 1,
      requiredUniqueFaceCount: 1,
    },
  },
  {
    id: 'q3',
    name: '合照2',
    defaultLocked: false,
    taskDetail: {
      type: 'photo',
      descriptionRichContent: '<h1>Take a photo with two people</h1>',
      successExplanation: 'success explanation 2',
      requiredFaceCount: 2,
      requiredUniqueFaceCount: 1,
    },
  },
];

const USE_MOCK_TASKS = false;

export async function getHuntTasks(openid: string, name: string): Promise<HuntTasks> {
  if (USE_MOCK_TASKS) {
    return await returnAfter(MOCK_TASKS, 500);
  }

  const { data, statusCode } = await request(`/api/hunt_tasks?openid=${openid}`, { name }, 'POST');
  if (statusCode !== 200) {
    throw new Error(`getHuntTasks failed: ${statusCode}`);
  }
  return HuntTasksSchema.parse(data);
}


