import { UiConfig, DEFAULT_UI_CONFIG } from './ui_config';

const API_BASEURL = 'https://wedding.blahgeek.com';

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
    throw new Error('getRsvp failed');
  }
  return data as RsvpResponse;
}

export async function submitRsvp(openid: string, data: RsvpResponse): Promise<void> {
  const { statusCode } = await request(`/api/rsvp?openid=${openid}`, { openid, ...data }, 'POST');
  if (statusCode !== 200) {
    throw new Error('submitRsvp failed');
  }
}

export interface HuntQuestion {
  questionRichContent: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GlobalConfig {
  uiConfig: UiConfig;
  huntQuestions: Record<string, HuntQuestion>;
}

export async function getGlobalConfig(): Promise<GlobalConfig> {
  const { data, statusCode } = await request('/api/global_config');
  if (statusCode !== 200) {
    throw new Error('getGlobalConfig failed');
  }

  let uiConfig: UiConfig = { ...DEFAULT_UI_CONFIG };
  for (const key_s in uiConfig) {
    const key = key_s as (keyof UiConfig);
    if (key in data.uiConfig && typeof data.uiConfig[key] === typeof uiConfig[key]) {
      uiConfig[key] = data.uiConfig[key];
    }
  }

  return {
    uiConfig,
    huntQuestions: data.huntQuestions,
  };
}
