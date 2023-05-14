Page({
  data: {
    formRules: [],
    formData: {
      participate: true,
      needHotel: false,
      needHotelStartDate: '2023-09-09',
      needHotelEndDate: '2023-09-10',
    },
  },

  formInputChange: function(e: WechatMiniprogram.Input) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value,
    });
  },
  submitForm: function() {},
})
