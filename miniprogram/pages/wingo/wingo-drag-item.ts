import 'miniprogram-api-typings';

Component({
  properties: {
    columns: {
      type: Number,
      value: 1
    },
    itemData: {
      type: Object,
      value: {}
    },
  },
  methods: {
    itemClick() {
      this.triggerEvent('click', {});
    }
  },
})
