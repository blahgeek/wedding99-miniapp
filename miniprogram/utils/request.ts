import 'miniprogram-api-typings';
import sha1 from 'sha1';

export const API_BASEURL = 'https://wedding.blahgeek.com';

const API_SIG_SALT = 'wedding99';

export async function request(path: string, data: any = undefined, method: 'GET' | 'POST' = 'GET'):
Promise<{ data: any, statusCode: number }> {
  let dataContent = data === undefined ? undefined : JSON.stringify(data);
  let sig = sha1(`${API_SIG_SALT}/${path}/${dataContent ?? ''}`);

  let header: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Sig': sig,
  };
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASEURL}${path}`,
      data: dataContent,
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
};

export async function returnAfter<T>(value: T, ms: number): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
};
