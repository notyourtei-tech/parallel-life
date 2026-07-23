import { describe, it, expect } from 'vitest';
import { isValid } from '@/app/shared/page';

const validWorld = {
  title: '世界A',
  timeline: [
    { age: 18, title: '节点1', description: 'd', emotion: 'neutral', milestone: 'm' },
    { age: 25, title: '节点2', description: 'd', emotion: 'neutral', milestone: 'm' },
  ],
};

describe('isValid (分享链接解码校验)', () => {
  it('合法载荷通过', () => {
    const tl = {
      id: 'x',
      createdAt: Date.now(),
      userInput: { age: 20, gender: '未指定', country: '未指定', occupation: '未指定', status: '未指定', keyDecision: '我决定辞职创业' },
      result: { worldA: validWorld, worldB: { ...validWorld, title: '世界B' } },
    };
    expect(isValid(tl)).toBe(true);
  });

  it('缺少 timeline 数组的构造链接被拒绝（防崩溃）', () => {
    const tl = {
      id: 'x',
      createdAt: Date.now(),
      userInput: { age: 20, gender: '未指定', country: '未指定', occupation: '未指定', status: '未指定', keyDecision: '我决定辞职创业' },
      // 只给标题、不提供 timeline，模拟旧版/被篡改的分享链接
      result: { worldA: { title: '世界A' }, worldB: { title: '世界B' } },
    };
    expect(isValid(tl)).toBe(false);
  });

  it('timeline 为空数组被拒绝', () => {
    const tl = {
      id: 'x',
      createdAt: Date.now(),
      userInput: { age: 20, gender: '未指定', country: '未指定', occupation: '未指定', status: '未指定', keyDecision: '我决定辞职创业' },
      result: { worldA: { ...validWorld, timeline: [] }, worldB: { ...validWorld, title: '世界B' } },
    };
    expect(isValid(tl)).toBe(false);
  });

  it('节点缺少 age 被拒绝', () => {
    const badNode = { title: '缺 age', description: 'd', emotion: 'neutral', milestone: 'm' };
    const tl = {
      id: 'x',
      createdAt: Date.now(),
      userInput: { age: 20, gender: '未指定', country: '未指定', occupation: '未指定', status: '未指定', keyDecision: '我决定辞职创业' },
      result: { worldA: { ...validWorld, timeline: [badNode as unknown as never] }, worldB: validWorld },
    };
    expect(isValid(tl)).toBe(false);
  });

  it('非对象/空值被拒绝', () => {
    expect(isValid(null)).toBe(false);
    expect(isValid('garbage')).toBe(false);
    expect(isValid({})).toBe(false);
  });
});
