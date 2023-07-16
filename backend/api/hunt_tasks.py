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
        id='q0',
        name='Q 0',
        defaultLocked=True,
        taskDetail=QuestionTaskDetail(
            questionRichContent='<h1>Question 1</h1>',
            answers=['A', 'B', 'C', 'D'],
            correctAnswer=0,
            explanation='Explanation 1',
            removeAnswersAfterAd=[],
        ),
    ),
    HuntTask(
        id='q3',
        name='合照2',
        defaultLocked=False,
        taskDetail=PhotoTaskDetail(
            descriptionRichContent='<h1>Take a photo with two people</h1>',
            successExplanation='success explanation 2',
            requiredFaceCount=2,
            requiredUniqueFaceCount=1,
        ),
    ),
]
