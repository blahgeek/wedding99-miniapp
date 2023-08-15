#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import random

_BINGO_PATTERNS = [
    *[0b111111 << (i * 5) for i in range(5)],
    *[0b00001000010000100001 << i for i in range(5)],
    0b1000001000001000001000001,
    0b0000100010001000100010000,
]


class Board:

    def __init__(self, max_n: int):
        nums = random.sample(range(1, max_n + 1), 25)
        self._num_to_idx = {n: i for i, n in enumerate(nums)}
        self._filled = (1 << 12)  # "FREE" block

    def has_bingo(self):
        return any(self._filled & p == p for p in _BINGO_PATTERNS)

    def fill(self, num: int):
        idx = self._num_to_idx.get(num, None)
        if idx is not None:
            self._filled |= 1 << idx



def simulate_once(max_n: int):
    board = Board(max_n)
    seq = list(range(1, max_n + 1))
    random.shuffle(seq)

    result = 0
    for num in seq:
        board.fill(num)
        result += 1
        if board.has_bingo():
            break
    return result


if __name__ == '__main__':
    max_n = int(sys.argv[1])

    count = 0
    sum = 0

    while True:
        count += 1
        sum += simulate_once(max_n)
        if count % 10000 == 0:
            print(f'#{count}: avg {sum / count}')

