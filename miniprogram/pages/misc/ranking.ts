import 'miniprogram-api-typings';

import { request } from '../../utils/request';

Page({
  data: {
    ranking: [],
  },

  onShow: async function() {
    wx.showLoading({
      title: 'Loading...',
    });
    const { data, statusCode } = await request('/api/hunt_score_ranking');
    if (statusCode === 200) {
      this.setData({
        ranking: data['ranking'],
      });
    }
    wx.hideLoading();
  },
})
