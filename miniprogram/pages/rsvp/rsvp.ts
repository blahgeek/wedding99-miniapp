import 'miniprogram-api-typings';
import { RsvpResponse, getRsvp, submitRsvp } from './api';
import { AppOption } from '../../utils/app_context';

const MAP_LONGITUDE = 116.479232;
const MAP_LATITUDE = 39.973909;

const app = getApp<AppOption>()

const defaultForm: RsvpResponse = {
  name: '',
  participate: false,
  plusOne: false,
  needHotel: false,
  needHotelStartDate: '2023-09-09',
  needHotelEndDate: '2023-09-10',
  notes: '',
};

Page({
  data: {
    uiConfig: {
      rsvpHotelNote: "我们可以为您安排酒店",
    },
    mapLongitude: MAP_LONGITUDE,
    mapLatitude: MAP_LATITUDE,
    mapMarkers: [{
      longitude: MAP_LONGITUDE,
      latitude: MAP_LATITUDE,
    }],
    formRules: [],
    formData: defaultForm,
    submitted: false,
  },

  onShow: async function() {
    wx.showLoading({
      title: 'Loading...',
    });
    this.setData(await app.context.getUiConfigUpdateData('rsvp'));
    const openid = await app.context.getOpenidCached();
    const existingResponse = await getRsvp(openid);
    console.info(`Existing RSVP response: ${JSON.stringify(existingResponse)}`);
    this.setData({
      formData: existingResponse ?? defaultForm,
      submitted: existingResponse !== undefined,
    });
    wx.hideLoading();
  },

  formInputChange: function(e: WechatMiniprogram.Input) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value,
    });
  },

  editForm: function() {
    this.setData({
      submitted: false,
    });
  },

  submitForm: async function() {
    console.info(`Submitting RSVP: ${JSON.stringify(this.data.formData)}`);
    wx.showLoading({
      title: '正在提交...',
    });
    try {
      const openid = await app.context.getOpenidCached();
      await submitRsvp(openid, this.data.formData);
      this.setData({
        submitted: true,
      });
      wx.showToast({
        title: '提交成功',
        icon: 'success',
      });
    } catch (e) {
      console.error(e);
      wx.showToast({
        title: '提交失败',
        icon: 'error',
      });
    } finally {
      wx.hideLoading();
    }
  },

  openMap: function () {
    wx.openLocation({
      longitude: MAP_LONGITUDE,
      latitude: MAP_LATITUDE,
      name: '罗兰湖餐厅',
      address: '北京市朝阳区芳园西路6号丽都公园内',
    });
  },
})
