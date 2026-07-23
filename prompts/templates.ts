import { UserInput, TimelineNode } from '@/types';

// 生成时间线的Prompt模板
export function buildTimelinePrompt(input: UserInput): string {
  return `你是一位擅长人生叙事的作家和心理学家。基于以下用户信息,生成两条平行人生时间线。

用户信息:
- 年龄: ${input.age}岁
- 性别: ${input.gender}
- 国家: ${input.country}
- 职业: ${input.occupation}
- 当前状态: ${input.status}
- 关键决定: ${input.keyDecision}

请生成两条对比鲜明的人生路线:

**World A**: 执行了该关键决定后的人生
**World B**: 没有执行该关键决定(或做出相反选择)的人生

根据用户当前年龄(${input.age}岁),选择合适的时间节点(至少4个,最多6个),覆盖从18岁到50岁或当前年龄之后的阶段。每个时间节点必须包含以下字段:
- age: 年龄(数字)
- year: 年份(根据当前年龄推算)
- event: 简短事件标题(10-20字)
- description: 详细描述这个时期的重要经历、挑战和成长(100-200字)
- emotion: 情绪标签,从以下选择: "excited"(兴奋)、"challenged"(挑战)、"peaceful"(平静)、"successful"(成功)、"regretful"(遗憾)、"neutral"(中性)
- milestone: 这个时期的关键成就或转折点(简洁描述)

要求:
1. 两条路线要有明显差异和对比
2. 故事情节要真实可信,符合逻辑
3. 包含职业发展、人际关系、个人成长等多个维度
4. 情绪变化要自然,有起伏
5. 避免过于极端或 unrealistic 的情节
6. 用中文回答

请严格按照以下JSON格式返回,不要包含markdown代码块标记或其他文字:

{
  "worldA": {
    "title": "路线A的标题",
    "timeline": [
      {
        "age": 18,
        "year": 2023,
        "event": "事件标题",
        "description": "详细描述...",
        "emotion": "excited",
        "milestone": "关键成就"
      }
    ]
  },
  "worldB": {
    "title": "路线B的标题",
    "timeline": [...]
  }
}`;
}

// 生成故事的Prompt模板
export function buildStoryPrompt(input: UserInput, worldType: 'A' | 'B', timeline: TimelineNode[]): string {
  const worldLabel = worldType === 'A' ? '执行了决定' : '没有执行决定';
  
  return `你是一位文学大师,擅长用第二人称叙述富有画面感的人生故事。

用户做出了一个关键决定:"${input.keyDecision}"

现在请为${worldLabel}的人生路线创作一篇连贯的叙事文章。

时间线节点:
${timeline.map(node => 
  `${node.age}岁(${node.year}年): ${node.event} - ${node.milestone}`
).join('\n')}

写作要求:
1. 使用第二人称"你"来叙述
2. 文学化语言,富有画面感和情感共鸣
3. 将各个时间节点串联成流畅的故事
4. 每个阶段约200-300字
5. 突出内心挣扎、成长和转折
6. 开头以"如果那天..."引入,营造神秘感
7. 结尾给人思考和启发
8. 用中文写作

请创作这篇人生故事:`;
}
