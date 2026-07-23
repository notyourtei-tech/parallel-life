// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveTimeline,
  getTimelines,
  getTimelineById,
  deleteTimeline,
  clearTimelines,
} from '@/lib/storage';
import type { LocalTimeline, UserInput, TimelineResult } from '@/types';

function makeTimeline(id: string): LocalTimeline {
  const input: UserInput = {
    age: 25,
    gender: '男',
    country: '中国',
    occupation: '工程师',
    status: '状态',
    keyDecision: '关键决定描述',
  };
  const result: TimelineResult = {
    worldA: {
      title: '路线A',
      timeline: [
        {
          age: 26,
          year: 2025,
          event: 'e',
          description: 'd',
          emotion: 'successful',
          milestone: 'm',
        },
      ],
    },
    worldB: {
      title: '路线B',
      timeline: [
        {
          age: 26,
          year: 2025,
          event: 'e',
          description: 'd',
          emotion: 'peaceful',
          milestone: 'm',
        },
      ],
    },
  };
  return {
    id,
    createdAt: Date.now(),
    userInput: input,
    result,
    images: [],
    processingTime: 1234,
  };
}

describe('storage', () => {
  beforeEach(() => {
    clearTimelines();
  });

  it('保存后可通过列表与ID获取', () => {
    saveTimeline(makeTimeline('t1'));
    const list = getTimelines();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('t1');
    expect(getTimelineById('t1')?.id).toBe('t1');
  });

  it('新保存的时间线排在最前', () => {
    saveTimeline(makeTimeline('old'));
    saveTimeline(makeTimeline('new'));
    const list = getTimelines();
    expect(list[0].id).toBe('new');
  });

  it('最多保留 10 条（超出丢弃最旧）', () => {
    for (let i = 0; i < 12; i++) {
      saveTimeline(makeTimeline(`t${i}`));
    }
    const list = getTimelines();
    expect(list).toHaveLength(10);
    expect(list[0].id).toBe('t11');
  });

  it('删除时间线', () => {
    saveTimeline(makeTimeline('t1'));
    deleteTimeline('t1');
    expect(getTimelines()).toHaveLength(0);
    expect(getTimelineById('t1')).toBeNull();
  });

  it('清空所有时间线', () => {
    saveTimeline(makeTimeline('t1'));
    saveTimeline(makeTimeline('t2'));
    clearTimelines();
    expect(getTimelines()).toHaveLength(0);
  });
});
