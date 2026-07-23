// 用户输入接口
export interface UserInput {
  age: number;
  gender: string;
  country: string;
  occupation: string;
  status: string;
  keyDecision: string;
}

// 时间线节点
export interface TimelineNode {
  age: number;
  year: number;
  event: string;
  description: string;
  emotion: 'excited' | 'challenged' | 'peaceful' | 'successful' | 'regretful' | 'neutral';
  milestone: string;
}

// 世界时间线
export interface WorldTimeline {
  title: string;
  timeline: TimelineNode[];
}

// 时间线结果
export interface TimelineResult {
  worldA: WorldTimeline;
  worldB: WorldTimeline;
  storyA?: string;
  storyB?: string;
}

// 生成的图片
export interface GeneratedImage {
  id: string;
  age: number;
  worldType: 'A' | 'B';
  imageUrl: string;
  prompt?: string;
}

// 本地存储的时间线
export interface LocalTimeline {
  id: string;
  createdAt: number;
  userInput: UserInput;
  result: TimelineResult;
  images: GeneratedImage[];
  processingTime?: number;
  pinned?: boolean;
}

// 表单验证错误
export interface FormErrors {
  age?: string;
  gender?: string;
  country?: string;
  occupation?: string;
  status?: string;
  keyDecision?: string;
}
