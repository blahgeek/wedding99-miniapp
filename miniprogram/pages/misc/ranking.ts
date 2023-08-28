import 'miniprogram-api-typings';

import { request } from '../../utils/request';

Page({
  data: {},

  onShow: async function() {
    wx.showLoading({
      title: 'Loading...',
    });
    const { data, statusCode } = await request('/api/hunt_score_ranking');
    if (statusCode === 200) {
      this.setData(data);
    }
    wx.hideLoading();
  },
})
