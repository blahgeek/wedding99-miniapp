
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
  mainRichContent: string;
  huntQuestions: Record<string, HuntQuestion>;
}

export async function getGlobalConfig(): Promise<GlobalConfig> {
  // TODO
  const mockConfig: GlobalConfig = {
    mainRichContent: 'This is the main rich content',
    huntQuestions: {
      'q0': {
        questionRichContent: 'This is the question rich content 1',
        answers: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'explain, answer is A',
      },
      'q1': {
        questionRichContent: 'This is the question rich content 2',
        answers: ['A', 'B', 'C', 'D'],
        correctAnswer: 1,
        explanation: 'explain, answer is B',
      },
      'q2': {
        questionRichContent: 'This is the question rich content 3',
        answers: ['A', 'B', 'C', 'D'],
        correctAnswer: 2,
        explanation: 'explain, answer is C',
      },
    },
  };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockConfig);
    }, 2000);
  });
}
