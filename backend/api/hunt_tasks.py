#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import itertools
import collections
import functools
import enum
import random
import typing as tp
import dataclasses

from .models import RsvpResponse


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


_DEFAULT_TASKS = [
    HuntTask(
        id='q_whoisshe',
        name='她是谁',
        defaultLocked=True,
        taskDetail=QuestionTaskDetail(
            questionRichContent='''
            <h3>以下哪张是新娘小时候的照片？</h3>
            <h4> A: </h4>
            <img width="100%" src="https://wedding-photo.blahgeek.com/assets/whoisshe/photo_6264892559738386395_y.jpg" />
            <h4> B: </h4>
            <img width="100%" src="https://wedding-photo.blahgeek.com/assets/whoisshe/photo_6264892559738386396_y.jpg" />
            <h4> C: </h4>
            <img width="100%" src="https://wedding-photo.blahgeek.com/assets/whoisshe/photo_6264892559738386397_y.jpg" />
            ''',
            answers=[' A', ' B', ' C'],
            correctAnswer=1,
            explanation='',
            removeAnswersAfterAd=[0],
        )
    ),
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
            <h4> A: </h4>
            <img width="100%" src="https://wedding-photo.blahgeek.com/assets/whoishe/photo_6264892559738386394_y.jpg" />
            <h4> B: </h4>
            <img width="100%" src="https://wedding-photo.blahgeek.com/assets/whoishe/photo_6264892559738386393_y.jpg" />
            <h4> C: </h4>
            <img width="100%" src="https://wedding-photo.blahgeek.com/assets/whoishe/photo_6264773159647558284_y.jpg" />
            ''',
            answers=[' A', ' B', ' C'],
            correctAnswer=2,
            explanation='',
            removeAnswersAfterAd=[0],
        )
    ),
]

_DEFAULT_EXTRA_TASKS = [
    HuntTask(
        id='q_howlong',
        name='How long',
        defaultLocked=True,
        taskDetail=QuestionTaskDetail(
            questionRichContent='''
            <h3>新郎新娘从在一起到现在的时间最接近：</h3>
            ''',
            answers=['30000000秒', '3000天', '300周', '0.3世纪'],
            correctAnswer=1,
            explanation='从2013年5月10日到今天是3774天',
            removeAnswersAfterAd=[3],
        )
    ),
]


_PHOTO_TASKS = (
    ('ph1', '今年刚入学的大学生'),
    ('ph2', '在北京三环内上班的人'),
    ('ph3', '在北京五环外上班的人'),
    ('ph4', '所在公司的logo颜色是暖色系的人'),
    ('ph5', '携伴到场的人'),
    ('ph6', '北方人'),
    ('ph7', '南方人'),
    ('ph8', '诉讼律师'),
    ('ph9', '非诉律师'),
    ('ph10', '同时认识新娘新郎超过5年的人'),
    ('ph11', '给新郎或新娘发过工资的人（上级/manager）'),
    ('ph12', '和新郎或新娘曾经是一个宿舍的人'),
)

def _get_photo_tasks(rand: random.Random, n: int) -> tp.Iterable[HuntTask]:
    for i, (id_, description) in enumerate(rand.sample(_PHOTO_TASKS, n)):
        yield HuntTask(
            id=f'q_photo_{id_}',
            name=f'合照{i}',
            defaultLocked=False,
            taskDetail=PhotoTaskDetail(
                descriptionRichContent=f'<h3>请在现场找到一位“{description}”并与Ta合照</h3>',
                successExplanation='',
                requiredFaceCount=2,
                requiredUniqueFaceCount=1,
            )
        )


class PersonLabel(enum.Enum):
    PROGRAMMER = 1
    THUSAST = 2
    FRIEND_OF_GROOM = 3
    FRIEND_OF_BRIDE = 4
    LAWYER = 5

_LABEL_TO_QUESTION_NAME = {
    PersonLabel.PROGRAMMER: 'Leetcode',
    PersonLabel.THUSAST: 'ThuSAST',
    PersonLabel.FRIEND_OF_GROOM: '寻找新郎',
    PersonLabel.FRIEND_OF_BRIDE: '寻找新娘',
    PersonLabel.LAWYER: '法考',
}

_LABEL_TO_GUEST_DESCRIPTION = {
    PersonLabel.PROGRAMMER: '程序员',
    PersonLabel.THUSAST: '(前)清华学生科协成员',
    PersonLabel.FRIEND_OF_GROOM: '新郎的朋友',
    PersonLabel.FRIEND_OF_BRIDE: '新娘的朋友',
    PersonLabel.LAWYER: '法律界人士',
}

# first element should be the answer. choices will be randomized on return.
_LABELED_QUESTIONS = [
    (PersonLabel.PROGRAMMER, 'lb1',
     '以下和其他不相等的是：',
     ['8', '0xf', '0b1111', '15']),
    (PersonLabel.PROGRAMMER, 'lb2',
     'c++中，以下哪个不是合法的表达式：',
     ['#1', '!1', '~1', '-1']),
    (PersonLabel.PROGRAMMER, 'lb3',
     'c++中，以下为真的是：',
     ['1&1', '0=0', '2-2', '3^3']),
    (PersonLabel.THUSAST, 'lb4',
     '当年科协活动主要在C楼的：',
     ['3层', '1层', '2层', '4层']),
    (PersonLabel.THUSAST, 'lb5',
     '新郎新娘相识在：',
     ['赛事部', '挑战部', '外联部', '活动部']),
    (PersonLabel.FRIEND_OF_GROOM, 'lb6',
     '新郎2023年7月8号朋友圈的内容：',
     ['300', '100', '200', '400']),
    (PersonLabel.FRIEND_OF_GROOM, 'lb7',
     '新郎2022年12月14号朋友圈的内容：',
     ['100', '300', '200', '400']),
    (PersonLabel.FRIEND_OF_BRIDE, 'lb8',
     '新娘朋友圈的封面图有：',
     ['松鼠', '长颈鹿', '熊猫', '海豚']),
    (PersonLabel.LAWYER, 'lb9',
     '法学界江湖人称“太皇太后”的教科书是以下哪个学科的：',
     ['刑法', '民法', '知识产权法', '婚姻法']),
    (PersonLabel.LAWYER, 'lb10',
     '以下哪个是真实存在的律师常用检索网站：',
     ['二郎神', '清源君', '齐天大圣', '法政先锋']),
]

_LABEL_TO_GUESTS = {
    PersonLabel.PROGRAMMER:
    ('贾开,吴育昕,张思浩,傅左右,章放,魏铭,郭城,段明静,周昕宇,梁健楠,许建林,谷嘉文,陈宇聪,李吉生,唐敏豪,温子煜,'
     '陈馨瑶,冯周天,张煜,张超,党凡,郭君健,于冰,惠轶群,马茗,翁喆,曹炎培,陆尧,林炳辉,王轩,梁亚雄,王杨,'
     '梁基宏,李阳光,吕铭,王康,范顺豪,何伟,张超'),
    PersonLabel.THUSAST:
    ('李吉生,温子煜,李健,李光裕,贾皓旸,黄蓓,张超,王谷恬,于琛,党凡,邓哲,韩梅君'),
    PersonLabel.FRIEND_OF_GROOM:
    ('贾开,吴育昕,张思浩,傅左右,章放,魏铭,郭城,段明静,周昕宇,梁健楠,许建林,谷嘉文,陈宇聪,李吉生,唐敏豪,温子煜,'
     '陈馨瑶,冯周天,张煜,李健,李光裕,贾皓旸,黄蓓,张超,王谷恬,于琛,党凡,郭君健,于冰,惠轶群,马茗,翁喆,'
     '刘震岳,马泽惠,曹炎培,陆尧,林炳辉,王轩,梁亚雄,王杨,梁基宏,李阳光,王宇坤,吕铭,王康,范顺豪,丁一,赵天翼,'
     '忻潇男,忻孝胜,姚敏杰,姚叶挺,姚宇波,姚宇涛,姚雪飞,何俊,何伟,邓哲,韩梅君,张超,孙悦,张凯'),
    PersonLabel.FRIEND_OF_BRIDE:
    ('李吉生,冯周天,李健,贾皓旸,王谷恬,于琛,陈娜,潘陈宇,孙泽文,邬丹,邓哲,韩梅君,刘二源,徐菊莹,刘峣,冯若宁,徐镜媛,'
     '于海桐,章健,李硕,张诗伟,朱雪菁,王莹,许奥雪,史英彤,郭若天,苏越,马越,何朕,赵赫,张超,张娜,张颖,张鑫,张岩,孙悦,张凯'),
    PersonLabel.LAWYER:
    ('姚宇波,陈娜,潘陈宇,孙泽文,邬丹,邓哲,韩梅君,刘二源,徐菊莹,刘峣,冯若宁,徐镜媛,于海桐,章健,李硕,张诗伟,朱雪菁,孙悦'),
}

@functools.lru_cache()
def _guest_to_labels():
    result = collections.defaultdict(lambda: set())
    for label, guests_str in _LABEL_TO_GUESTS.items():
        names = [x.strip() for x in guests_str.split(',') if x.strip()]
        for name in names:
            result[name].add(label)
    return dict(result)


def _get_labeled_tasks(rand: random.Random,
                       exclude_labels: set[PersonLabel]) -> tp.Iterable[HuntTask]:
    for label in PersonLabel:
        if label in exclude_labels:
            continue
        choices = [x for x in _LABELED_QUESTIONS if x[0] == label]
        _, id_, description, answers = rand.choice(choices)

        correct_answer = answers[0]
        correct_answer_idx = rand.randrange(0, len(answers))
        answers = answers[1:]
        rand.shuffle(answers)
        answers.insert(correct_answer_idx, correct_answer)
        remove_answers_after_ad = [(correct_answer_idx + 1) % len(answers),
                                   (correct_answer_idx + 2) % len(answers),]

        yield HuntTask(
            id='q_labeled_' + id_,
            name=_LABEL_TO_QUESTION_NAME[label],
            defaultLocked=False,
            taskDetail=QuestionTaskDetail(
                questionRichContent=f'''
                <i>请在现场找一位{_LABEL_TO_GUEST_DESCRIPTION[label]}，和Ta搭讪，让Ta告诉你这道题的答案。</i>
                <br />
                {description}
                ''',
                answers=[' ' + x for x in answers],
                correctAnswer=correct_answer_idx,
                explanation='',
                removeAnswersAfterAd=remove_answers_after_ad,
            ),
        )



def get_tasks(openid: str, name: str) -> list[HuntTask]:
    try:
        rsvp_name = RsvpResponse.objects.get(openid=openid).name
    except RsvpResponse.DoesNotExist:
        rsvp_name = ''

    should_lockall = True  # TODO

    rand = random.Random(openid)

    labels = _guest_to_labels().get(name, set()) | _guest_to_labels().get(rsvp_name, set())
    labeled_tasks = list(itertools.islice(_get_labeled_tasks(rand, labels), 3))  # get most 3

    default_tasks = _DEFAULT_TASKS[:]
    if len(labeled_tasks) < 3:
        default_tasks += _DEFAULT_EXTRA_TASKS[:(3 - len(labeled_tasks))]

    photo_tasks = _get_photo_tasks(rand, 9 - len(labeled_tasks) - len(default_tasks))  # total 9

    result = default_tasks + labeled_tasks + list(photo_tasks)
    if should_lockall:
        result = [dataclasses.replace(x, defaultLocked=True) for x in result]
    return result
