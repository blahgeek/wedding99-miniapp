import { getMockGlobalConfig } from './api_mock';

const API_BASEURL = 'https://wedding.blahgeek.com';
const DEBUG = true;

async function request(path: string, data: any = undefined, method: 'GET' | 'POST' = 'GET'):
Promise<{ data: any, statusCode: number }> {
  let header: any = {};
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASEURL}${path}`,
      data,
      method,
      header,
      dataType: 'json',
      success: (res) => {
        resolve({
          data: res.data,
          statusCode: res.statusCode,
        });
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

export interface RsvpResponse {
  // openid is not part of this interface
  name: string,
  participate: boolean,
  plusOne: boolean,
  needHotel: boolean,
  needHotelStartDate: string,
  needHotelEndDate: string,
  notes: string,
}

export async function code2session(code: string): Promise<any> {
  return (await request('/api/code2session', { code })).data;
}

export async function getRsvp(openid: string): Promise<RsvpResponse | undefined> {
  const { data, statusCode } = await request(`/api/rsvp?openid=${openid}`);
  if (statusCode === 404) {
    return undefined;
  }
  if (statusCode !== 200) {
    throw new Error(`getRsvp failed: ${statusCode}`);
  }
  return data as RsvpResponse;
}

export async function submitRsvp(openid: string, data: RsvpResponse): Promise<void> {
  const { statusCode } = await request(`/api/rsvp?openid=${openid}`, { openid, ...data }, 'POST');
  if (statusCode !== 200) {
    throw new Error(`submitRsvp failed: ${statusCode}`);
  }
}

export interface HuntQuestion {
  questionRichContent: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GlobalConfig {
  uiConfig: Record<string, string>;
  huntQuestions: Record<string, HuntQuestion>;
}

export async function getGlobalConfig(): Promise<GlobalConfig> {
  if (DEBUG) {
    return await getMockGlobalConfig();
  }

  const { data, statusCode } = await request('/api/global_config');
  if (statusCode !== 200) {
    throw new Error(`getGlobalConfig failed: ${statusCode}`);
  }

  return {
    uiConfig: data.uiConfig || {},
    huntQuestions: data.huntQuestions || {},
  };
}

export async function submitHuntScore(openid: string, name: string, score: number): Promise<void> {
  const { statusCode } = await request(`/api/hunt_score?openid=${openid}`, { name, score }, 'POST');
  if (statusCode !== 200) {
    throw new Error(`postHuntScore failed: ${statusCode}`);
  }
}
