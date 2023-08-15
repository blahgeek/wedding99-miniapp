import 'miniprogram-api-typings';

import { AppOption } from '../../utils/app_context';

const SIZE = 5;

function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

function range(start: number, end: number): number[] {
  return Array(end - start).fill(0).map((_, i) => i + start);
};

const app = getApp<AppOption>()

Page({
  data: {
    nums: [] as number[][],
    activeMap: {} as Record<number, boolean>,
    hasBingo: false,

    uiConfig: {
      bingoMaxN: '50',
      bingoFooter: 'max_n=50, E(turns)=26.8',
    },
  },

  _reset: function() {
    let maxN = +this.data.uiConfig.bingoMaxN;
    let allnums = range(1, maxN + 1)
    shuffleArray(allnums);
    allnums[Math.floor(SIZE/2) * SIZE + Math.floor(SIZE/2)] = -1;

    const nums = range(0, SIZE).map(i => {
      return allnums.slice(i * SIZE, (i + 1) * SIZE);
    });
    this.setData({
      nums,
      activeMap: {
        [-1]: true,
      },
      hasBingo: false,
    });
  },

  _isActive: function(i: number, j: number) {
    return this.data.activeMap[this.data.nums[i][j]];
  },

  _hasBingo: function() {
    if (range(0, SIZE).some(i => range(0, SIZE).every(j => this._isActive(i, j)))) {
      return true;
    }
    if (range(0, SIZE).some(j => range(0, SIZE).every(i => this._isActive(i, j)))) {
      return true;
    }
    if (range(0, SIZE).every(i => this._isActive(i, i))) {
      return true;
    }
    if (range(0, SIZE).every(i => this._isActive(i, SIZE - i - 1))) {
      return true;
    }
    return false;
  },

  onTap: function(e: WechatMiniprogram.BaseEvent) {
    const val = +e.currentTarget.dataset.val;
    if (val === -1) {
      return;
    }
    this.setData({
      activeMap: {
        ...this.data.activeMap,
        [val]: !this.data.activeMap[val]
      },
    });
    this.setData({
      hasBingo: this._hasBingo(),
    });
  },

  onLoad: async function() {
    wx.showLoading({
      title: 'Loading...',
    });
    this.setData(await app.context.getUiConfigUpdateData('bingo'));
    wx.hideLoading();
    this._reset();
  },

  reset: function() {
    this._reset();
  }

})
