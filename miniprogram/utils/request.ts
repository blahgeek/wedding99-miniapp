import 'miniprogram-api-typings';

const API_BASEURL = 'https://wedding.blahgeek.com';

export async function request(path: string, data: any = undefined, method: 'GET' | 'POST' = 'GET'):
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
};

export async function returnAfter<T>(value: T, ms: number): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
};
