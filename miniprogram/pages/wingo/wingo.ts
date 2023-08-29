import 'miniprogram-api-typings';
import { z } from 'zod';

import { AppOption } from '../../utils/app_context';

const app = getApp<AppOption>();

const STORAGE_KEY = 'wingo_state';
const DEBUG_WORDS = Array(40).fill(0).map((_, i) => `word-${i}`).join(',');

function range(start: number, end: number): number[] {
  return Array(end - start).fill(0).map((_, i) => i + start);
};

function areSetsEqual(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every(value => b.has(value));
}


const GameStateSchema = z.object({
  isEditing: z.boolean().default(true),
  words: z.array(z.string()).default([]),
  activeMap: z.record(z.boolean()).default({}),
});

type GameState = z.infer<typeof GameStateSchema>;

const INITIAL_GAME_STATE: GameState = {
  isEditing: true,
  words: [],
  activeMap: {},
};

function readGameStateFromStorage(): GameState {
  const state = wx.getStorageSync(STORAGE_KEY);
  try {
    return GameStateSchema.parse(JSON.parse(state));
  } catch (e) {
    return {...INITIAL_GAME_STATE};
  }
}

function calculateBingo(state: GameState) {
  const _isActive = (i: number, j: number) => {
    return state.activeMap[state.words[i * 5 + j]];
  };

  const SIZE = 5;
  if (range(0, SIZE).some(i => range(0, SIZE).every(j => _isActive(i, j)))) {
    return true;
  }
  if (range(0, SIZE).some(j => range(0, SIZE).every(i => _isActive(i, j)))) {
    return true;
  }
  if (range(0, SIZE).every(i => _isActive(i, i))) {
    return true;
  }
  if (range(0, SIZE).every(i => _isActive(i, SIZE - i - 1))) {
    return true;
  }
  return false;
};


type DragListData = {
  dragId: string,
  fixed: boolean,
  inBoard: boolean,  // top 25
};

Page({
  data: {
    scrollTop: 0,
    pageMetaScrollTop: 0,

    state: INITIAL_GAME_STATE as GameState,

    dragListData: [] as DragListData[],
    dragExtraNodes: Array(5).fill(0).map((_, i) => {
      return {
        type: 'destBefore',
        dragId: `__separator-${i}`,
        destKey: 25,
        fixed: true,
        slot: `drag-separator-${i}`,
      };
    }),

    inBoardWords: [] as string[],
    hasBingo: false,
  },

  _setGameState: function(newState: GameState) {
    console.log(newState);
    this.setData({
      state: newState,
      hasBingo: calculateBingo(newState),
      inBoardWords: newState.words.slice(0, 25),
      dragListData: newState.words.map((w, i) => {
        return {
          dragId: w,
          fixed: false,
          inBoard: i < 25,
        };
      }),
    });
    if (newState.isEditing) {
      const drag = this.selectComponent('#drag');
      drag.init();
    }
    wx.setStorageSync(STORAGE_KEY, JSON.stringify(newState));
  },

  onSortEnd: function(e: any) {
    const listData = e.detail.listData;
    this._setGameState({
      ...this.data.state,
      isEditing: true,
      words: listData.map((d: any) => d.dragId) as string[],
    });
  },

  onPageScroll: function(e: any) {
    this.setData({
      scrollTop: e.scrollTop
    });
  },

  scroll: function(e: any) {
    this.setData({
      pageMetaScrollTop: e.detail.scrollTop
    })
  },

  finishEdit: async function() {
    const res = await new Promise<WechatMiniprogram.ShowModalSuccessCallbackResult>((resolve, reject) => {
      wx.showModal({
        title: '提示',
        content: '确认完成编辑吗？',
        success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => resolve(res),
        fail: () => reject(),
      });
    });
    if (!res.confirm) {
      return;
    }
    this._setGameState({
      ...this.data.state,
      isEditing: false,
      activeMap: {},
    });
  },

  reset: async function() {
    const res = await new Promise<WechatMiniprogram.ShowModalSuccessCallbackResult>((resolve, reject) => {
      wx.showModal({
        title: '提示',
        content: '确认重新开始吗？',
        success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => resolve(res),
        fail: () => reject(),
      });
    });
    if (!res.confirm) {
      return;
    }
    this._setGameState({
      ...this.data.state,
      isEditing: true,
      activeMap: {},
    });
  },

  onTapItem: function(e: any) {
    const word = e.currentTarget.dataset.word as string;
    const state = this.data.state;
    this._setGameState({
      ...state,
      activeMap: {
        ...state.activeMap,
        [word]: !state.activeMap[word],
      },
    });
  },

  onLoad: async function() {
    wx.showLoading({
      title: 'Loading...',
    });
    const oldState = readGameStateFromStorage();
    const globalConfig = await app.context.getGlobalConfigCached();

    const words = new Set((globalConfig.uiConfig['wingoWords'] || DEBUG_WORDS).split(','));
    if (areSetsEqual(words, new Set(oldState.words))) {
      this._setGameState(oldState);
    } else {
      this._setGameState({
        ...INITIAL_GAME_STATE,
        words: [...words],
      });
    }
    wx.hideLoading();
  },

})
