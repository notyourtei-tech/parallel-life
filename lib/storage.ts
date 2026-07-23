import { LocalTimeline } from '@/types';
import { MAX_TIMELINES } from '@/lib/config';
import { reportError } from '@/lib/logger';

const STORAGE_KEY = 'parallel_life_timelines';

let _cache: LocalTimeline[] | null = null;

function readCache(): LocalTimeline[] {
  if (_cache !== null) return [..._cache];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    _cache = data ? JSON.parse(data) : [];
  } catch (error) {
    reportError('storage.readCache', error);
    _cache = [];
  }
  return [..._cache!];
}

// 写入 localStorage；失败（如配额超限）时回滚内存缓存并向上抛出，避免内存与磁盘不一致。
function writeCache(data: LocalTimeline[]): void {
  const prev = _cache;
  _cache = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    _cache = prev;
    throw err;
  }
}

function invalidateCache(): void {
  _cache = null;
}

// saveTimeline 的结果：ok 表示是否写入成功；evicted 表示是否因超过上限淘汰了最旧记录。
export type SaveResult = { ok: boolean; evicted: boolean; error?: string };

// 保存时间线到 localStorage
export function saveTimeline(timeline: LocalTimeline): SaveResult {
  try {
    const existing = readCache();
    existing.unshift(timeline);
    const evicted = existing.length > MAX_TIMELINES;
    const updated = existing.slice(0, MAX_TIMELINES);
    writeCache(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('parallel-life-update'));
    }
    return { ok: true, evicted };
  } catch (error) {
    reportError('saveTimeline', error);
    return {
      ok: false,
      evicted: false,
      error: '本地存储空间不足，无法保存这条记录。请在首页删除部分旧记录后重试。',
    };
  }
}

// 获取所有时间线
export function getTimelines(): LocalTimeline[] {
  return readCache();
}

// 根据ID获取时间线
export function getTimelineById(id: string): LocalTimeline | null {
  const timelines = readCache();
  return timelines.find(t => t.id === id) || null;
}

// 删除时间线
export function deleteTimeline(id: string): void {
  try {
    const timelines = readCache();
    const updated = timelines.filter(t => t.id !== id);
    writeCache(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('parallel-life-update'));
    }
  } catch (error) {
    reportError('deleteTimeline', error);
  }
}

// 切换时间线的置顶状态（收藏）
export function togglePinTimeline(id: string): void {
  try {
    const timelines = readCache();
    const index = timelines.findIndex(t => t.id === id);
    if (index !== -1) {
      // 用不可变更新生成新对象，避免直接修改 _cache 中共享的引用
      // （readCache 返回的是浅拷贝数组，元素仍是 _cache 里的同一对象）。
      const updated = timelines.map((t, i) =>
        i === index ? { ...t, pinned: !t.pinned } : t,
      );
      writeCache(updated);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('parallel-life-update'));
      }
    }
  } catch (error) {
    reportError('togglePinTimeline', error);
  }
}

// 清空所有时间线
export function clearTimelines(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    invalidateCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('parallel-life-update'));
    }
  } catch (error) {
    reportError('clearTimelines', error);
  }
}
