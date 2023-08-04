import 'miniprogram-api-typings';

import BACKGROUND_IMG_DATA from '../../images/import/main_background.jpg';
import FOREGROUND_IMG_DATA from '../../images/import/main_foreground.png';
import { AppOption } from '../../utils/app_context';

const app = getApp<AppOption>()

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
};

const SCREEN_WIDTH = wx.getSystemInfoSync().screenWidth;


Page({
  data: {
    gyroValue: [0, 0, 0],

    backgroundImgUrl: '',
    foregroundImgUrl: '',

    foregroundOffsetX: 0,
    foregroundOffsetY: 0,

    uiConfig: {
      mainShareMessageTitle: undefined,
      mainShareMessageImage: undefined,
      mainShareTimelineTitle: undefined,
      mainShareTimelineImage: undefined,
    },
  },

  handleGyroChange: function(event: WechatMiniprogram.OnGyroscopeChangeListenerResult) {
    const gyroValue = [
      clamp(this.data.gyroValue[0] + event.x, -30, 30),
      clamp(this.data.gyroValue[1] + event.y, -30, 30),
      clamp(this.data.gyroValue[2] + event.z, -30, 30),
    ];
    console.log(event, gyroValue);

    this.setData({
      gyroValue,
      foregroundOffsetX: gyroValue[1] * SCREEN_WIDTH / 1000,
      foregroundOffsetY: gyroValue[0] * SCREEN_WIDTH / 1000,
    });
  },

  onShow: function() {
    console.log('Starting gyroscope');
    this.setData({
      gyroValue: [0, 0, 0],
      foregroundOffsetX: 0,
      foregroundOffsetY: 0,
    });
    wx.startGyroscope({
      interval: 'ui',
      success: () => {
        console.log('Gyroscope started');
        wx.onGyroscopeChange(this.handleGyroChange);
      },
    });
  },

  onHide: function() {
    console.log('Stopping gyroscope');
    wx.offGyroscopeChange();
    wx.stopGyroscope();
  },

  onLoad: async function() {
    wx.showLoading({
      title: 'Loading...'
    });

    this.setData({
      backgroundImgUrl: BACKGROUND_IMG_DATA,
      foregroundImgUrl: FOREGROUND_IMG_DATA,
    });
    this.setData(await app.context.getUiConfigUpdateData('main'));
    wx.hideLoading();
  },

  onShareAppMessage: function() {
    return {
      title: this.data.uiConfig.mainShareMessageTitle,
      imageUrl: this.data.uiConfig.mainShareMessageImage,
    };
  },

  onShareTimeline: function() {
    return {
      title: this.data.uiConfig.mainShareTimelineTitle,
      imageUrl: this.data.uiConfig.mainShareTimelineImage,
    };
  },

})
