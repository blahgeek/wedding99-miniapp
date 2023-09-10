#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import random
from textwrap import dedent


def getUIConfig():
    wingo_words = ('无暇顾我,太黏人,无理取闹,'
                   '路痴,生闷气,选择困难,'
                   '咖啡上瘾,酒精上瘾,游戏上瘾,身高太矮,容易吃醋,'
                   '大方脸,小胖墩,马路杀手,'
                   '八卦,恋爱脑,败家,丢三落四,洁癖,文盲,多愁善感,'
                   '减肥困难,爱哭鬼,睡得太多,作息紊乱,起床气,'
                   '抠门,脸盲,强迫症,唠叨').split(',')
    random.shuffle(wingo_words)
    return {
        'wingoWords': ','.join(wingo_words),

        # post day
        'huntHtml': dedent('''
        <p>在婚礼现场完成任务，完成最多的人有礼物噢！</p>
        <p><i>任务现已默认解锁，不再更新排行榜，如需要上传的合照图片可联系新郎</i></p>
        '''),
    }
