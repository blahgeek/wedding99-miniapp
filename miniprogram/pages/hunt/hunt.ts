import { AppOption } from '../../utils/app_context';

const app = getApp<AppOption>()


const STORAGE_HUNT_STATE_KEY = 'hunt_state';
const QRCODE_PREFIX = 'wedding99:';

interface HuntState {
  name?: string;
  foundList: string[];
  correctList: string[];
}

const DEFAULT_HUNT_STATE: HuntState = {
  name: undefined,
  foundList: [],
  correctList: [],
};

function readHuntStateFromStorage() {
  const state = wx.getStorageSync(STORAGE_HUNT_STATE_KEY);
  if (state) {
    return JSON.parse(state) as HuntState;
  }
  return { ...DEFAULT_HUNT_STATE };
}

function writeHuntStateToStorage(state: HuntState) {
  wx.setStorageSync(STORAGE_HUNT_STATE_KEY, JSON.stringify(state));
}

let huntState = readHuntStateFromStorage();


Page({
  data: {
    huntQuestionsCount: 0,
    huntState,
    uiConfig: {
      huntAlreadyFound: '这个二维码已经扫过了',
      huntInvalidScan: '这不是你要找的二维码',
      huntResetConfirm: '确定重新开始吗？',
      huntNameInputPlaceholder: '请输入姓名后开始',
      huntScanButton: '扫码',
    },
  },
  onLoad: async function() {
    wx.showLoading({
      title: 'Loading',
    });
    this.setData(await app.context.getUiConfigUpdateData('hunt'));
    const globalConfig = await app.context.getGlobalConfigCached();
    huntState.foundList = huntState.foundList.filter((x) => x in globalConfig.huntQuestions);
    huntState.correctList = huntState.correctList.filter((x) => x in globalConfig.huntQuestions);
    writeHuntStateToStorage(huntState);

    this.setData({
      huntQuestionsCount: Object.keys(globalConfig.huntQuestions).length,
      huntState,
    });

    wx.hideLoading();
  },

  submitNameAndStart: function(e: WechatMiniprogram.Input) {
    if (e.detail.value.length === 0) {
      return;
    }
    huntState.name = e.detail.value;
    this.setData({ huntState });
    writeHuntStateToStorage(huntState);
  },

  userReset: function() {
    wx.showModal({
      title: '提示',
      content: this.data.uiConfig.huntResetConfirm,
      success: (res) => {
        if (res.confirm) {
          huntState = { ...DEFAULT_HUNT_STATE };
          this.setData({ huntState });
          writeHuntStateToStorage(huntState);
        }
      },
    });
  },

  scanCode: async function() {
    const scanResult: WechatMiniprogram.ScanCodeSuccessCallbackResult =
      await new Promise((resolve, reject) => {
        wx.scanCode({
          onlyFromCamera: true,
          success: (res) => {
            resolve(res);
          },
          fail: (err) => {
            reject(err);
          },
        });
      });
    const questions = (await app.context.getGlobalConfigCached()).huntQuestions;
    const questionId = scanResult.result.startsWith(QRCODE_PREFIX) ?
      scanResult.result.substr(QRCODE_PREFIX.length) : '';
    if (!(questionId in questions)) {
      wx.showToast({
        title: this.data.uiConfig.huntInvalidScan,
        icon: 'error',
      });
      return;
    }

    if (huntState.foundList.indexOf(questionId) >= 0) {
      wx.showToast({
        title: this.data.uiConfig.huntAlreadyFound,
        icon: 'error',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/hunt/hunt_detail?id=${questionId}`,
      events: {
        onAnswer: (data: {isCorrect: boolean}) => {
          console.log(`onAnswer: ${questionId}, ${data.isCorrect}`);
          if (huntState.foundList.indexOf(questionId) === -1) {
            huntState.foundList.push(questionId);
          }
          if (huntState.correctList.indexOf(questionId) === -1 && data.isCorrect) {
            huntState.correctList.push(questionId);
          }
          this.setData({ huntState });
          writeHuntStateToStorage(huntState);
        },
      }
    });
  },
})
