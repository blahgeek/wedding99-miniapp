const MAP_LONGITUDE = 116.479232;
const MAP_LATITUDE = 39.973909;

Component({
  data: {
    mapLongitude: MAP_LONGITUDE,
    mapLatitude: MAP_LATITUDE,
    mapMarkers: [{
      longitude: MAP_LONGITUDE,
      latitude: MAP_LATITUDE,
    }],
  },
  methods: {
    onTap: function () {
      wx.openLocation({
        longitude: MAP_LONGITUDE,
        latitude: MAP_LATITUDE,
      });
    },
  }
})
