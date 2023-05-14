import { RsvpResponse, getRsvp, submitRsvp } from '../../utils/api';
import { AppOption } from '../../utils/app_context';

const app = getApp<AppOption>()

const defaultForm: RsvpResponse = {
  name: '',
  participate: true,
  plusOne: false,
  needHotel: false,
  needHotelStartDate: '2023-09-09',
  needHotelEndDate: '2023-09-10',
  notes: '',
};

Page({
  data: {
    formRules: [],
    formData: defaultForm,
    submitted: false,
  },

  onShow() {
    wx.showLoading({
      title: 'Loading',
    });
    (async () => {
      const openid = await app.context.getOpenidCached();
      const existingResponse = await getRsvp(openid);
      console.info(`Existing RSVP response: ${JSON.stringify(existingResponse)}`);
      this.setData({
        formData: existingResponse ?? defaultForm,
        submitted: existingResponse !== undefined,
      });
      wx.hideLoading();
    })();
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
      title: 'Submitting...',
    });
    try {
      const openid = await app.context.getOpenidCached();
      await submitRsvp(openid, this.data.formData);
      this.setData({
        submitted: true,
      });
      wx.showToast({
        title: 'Submitted!',
        icon: 'success',
      });
    } catch (e) {
      console.error(e);
      wx.showToast({
        title: 'Error submitting',
        icon: 'error',
      });
    } finally {
      wx.hideLoading();
    }
  },
})
