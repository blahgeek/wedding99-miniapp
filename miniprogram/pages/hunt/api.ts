import 'miniprogram-api-typings';
import { z } from 'zod';

import { request, API_BASEURL } from '../../utils/request';

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
}

