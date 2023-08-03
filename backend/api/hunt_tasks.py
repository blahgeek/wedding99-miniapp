#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import typing as tp
import dataclasses


@dataclasses.dataclass
class QuestionTaskDetail:
    questionRichContent: str
    answers: list[str]
    correctAnswer: int
    explanation: str
    removeAnswersAfterAd: list[int]
    type: str = 'question'


@dataclasses.dataclass
class PhotoTaskDetail:
    descriptionRichContent: str
    successExplanation: str
    requiredFaceCount: int
    requiredUniqueFaceCount: int
    type: str = 'photo'


@dataclasses.dataclass
class HuntTask:
    id: str
    name: str
    defaultLocked: bool
    taskDetail: tp.Union[QuestionTaskDetail, PhotoTaskDetail]


ALL_TASKS = [
    HuntTask(
        id='q_ouyang',
        name='谁最帅',
        defaultLocked=True,
        taskDetail=QuestionTaskDetail(
            questionRichContent='''
            <h3>以下哪一位是新娘最喜欢的明星？</h3>
            <img width="100%" src="https://wedding-photo.blahgeek.com/assets/question_ouyang.jpg" />
            ''',
            answers=[' A. 欧阳震华', ' B. 陈冠希', ' C. 周杰伦', ' D. 吴彦祖'],
            correctAnswer=0,
            explanation='新娘说明显欧阳震华是最帅的',
            removeAnswersAfterAd=[1, 3],
        )
    ),
    HuntTask(
        id='q_whoishe',
        name='谁最帅2',
        defaultLocked=True,
        taskDetail=QuestionTaskDetail(
            questionRichContent='''
            <h3>以下哪张是新郎小时候的照片？</h3>
            ''',
            answers=[' A', ' B', ' C', ' D'],
            correctAnswer=1,
            explanation='',
            removeAnswersAfterAd=[],
        )
    ),
    HuntTask(
        id='q_coding_0',
        name='Leetcode0',
        defaultLocked=True,
        taskDetail=QuestionTaskDetail(
            questionRichContent='''
            <i>请在现场找一位程序员，和Ta搭讪，然后让Ta告诉你这道题的答案。
            （如果你就是程序员，那很幸运，这是道送分题...）</i>
            <br />
            c++中，以下为真的是：
            ''',
            answers=['0=0', '1&1', '2-2', '3^3'],
            correctAnswer=1,
            explanation='先不管对不对。加微信了吗？',
            removeAnswersAfterAd=[0],
        ),
    ),
    HuntTask(
        id='q_photo_1',
        name='合照1',
        defaultLocked=True,
        taskDetail=PhotoTaskDetail(
            descriptionRichContent='<h3>现场有一位刚入学的大学生，请找到TA并与TA合照</h3>',
            successExplanation='',
            requiredFaceCount=2,
            requiredUniqueFaceCount=1,
        ),
    ),
    HuntTask(
        id='q_photo_2',
        name='合照2',
        defaultLocked=True,
        taskDetail=PhotoTaskDetail(
            descriptionRichContent='<h3>现场有很多位律师，请找到其中一位并与TA合照</h3>',
            successExplanation='',
            requiredFaceCount=2,
            requiredUniqueFaceCount=1,
        ),
    ),
]
