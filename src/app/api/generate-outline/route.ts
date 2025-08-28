import { NextRequest, NextResponse } from 'next/server';
import { OutlineGenerationRequest, OutlineNode } from '../../lib/bookTypes';

export async function POST(request: NextRequest) {
  try {
    const body: OutlineGenerationRequest = await request.json();
    
    // 获取API设置
    const apiProvider = request.headers.get('x-api-provider') || 'openai';
    const apiKey = request.headers.get('x-api-key');
    const model = request.headers.get('x-model') || 'gpt-3.5-turbo';
    const baseUrl = request.headers.get('x-base-url');

    if (!apiKey) {
      return NextResponse.json({ error: 'API密钥未设置' }, { status: 400 });
    }

    // 构建提示词
    const prompt = buildOutlinePrompt(body);

    // 调用AI API
    const aiResponse = await callAiApi({
      provider: apiProvider,
      apiKey,
      model,
      baseUrl,
      prompt
    });

    // 解析AI响应并构建提纲结构
    const outline = parseAiResponse(aiResponse, body);

    return NextResponse.json({
      outline,
      summary: `基于${body.structure}结构生成的${body.genre}类型书籍提纲`,
      recommendations: [
        '建议在每个章节中加入具体的冲突点',
        '考虑角色发展弧线的完整性',
        '确保主题在各章节中得到体现'
      ]
    });

  } catch (error) {
    console.error('生成提纲错误:', error);
    return NextResponse.json(
      { error: '生成提纲失败，请检查API设置和网络连接' },
      { status: 500 }
    );
  }
}

function buildOutlinePrompt(request: OutlineGenerationRequest): string {
  const structureGuide = {
    'three-act': '三幕结构：第一幕(建立)、第二幕(对抗)、第三幕(解决)',
    'hero-journey': '英雄之旅：平凡世界、冒险召唤、拒绝召唤、遇见导师、跨越第一道门槛、试炼盟友敌人、接近洞穴最深处、磨难、奖赏、回归之路、复活、带着仙丹妙药归来',
    'five-act': '五幕结构：引子、上升动作、高潮、下降动作、结局',
    'custom': '自定义结构'
  };

  return `请为以下书籍生成详细的提纲：

书名：${request.bookTitle}
类型：${request.genre}
主题：${request.theme}
目标读者：${request.targetAudience}
目标字数：${request.targetWordCount}字
故事结构：${structureGuide[request.structure]}
关键要素：${request.keyElements.join('、')}
额外要求：${request.additionalRequirements}

请按照以下JSON格式返回提纲，包含层次化的结构：

{
  "outline": [
    {
      "id": "1",
      "title": "第一部分标题",
      "description": "这一部分的详细描述",
      "type": "part",
      "level": 1,
      "order": 1,
      "estimatedWordCount": 25000,
      "status": "planned",
      "notes": "创作备注",
      "keyPoints": ["关键要点1", "关键要点2"],
      "children": [
        {
          "id": "1-1",
          "title": "第一章标题",
          "description": "章节描述",
          "type": "chapter",
          "level": 2,
          "order": 1,
          "parentId": "1",
          "estimatedWordCount": 5000,
          "status": "planned",
          "notes": "章节备注",
          "keyPoints": ["章节要点1", "章节要点2"],
          "children": []
        }
      ]
    }
  ]
}

要求：
1. 根据目标字数合理分配各部分的字数
2. 确保提纲逻辑清晰，层次分明
3. 每个节点都要有具体的描述和关键要点
4. 体现所选择的故事结构
5. 融入提供的关键要素
6. 适合目标读者群体
7. 只返回JSON格式的数据，不要其他文字`;
}

async function callAiApi(params: {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl?: string | null;
  prompt: string;
}) {
  const { provider, apiKey, model, baseUrl, prompt } = params;

  let apiUrl = '';
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  let body: any = {};

  switch (provider) {
    case 'openai':
      apiUrl = baseUrl || 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      };
      break;

    case 'grok':
      apiUrl = baseUrl || 'https://api.x.ai/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      };
      break;

    case 'deepseek':
      apiUrl = baseUrl || 'https://api.deepseek.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      };
      break;

    case 'ollama':
      apiUrl = `${baseUrl || 'http://localhost:11434'}/api/generate`;
      body = {
        model,
        prompt,
        stream: false
      };
      break;

    default:
      throw new Error(`不支持的API提供商: ${provider}`);
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(300000) // 5分钟超时
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // 根据不同的API提供商解析响应
  switch (provider) {
    case 'openai':
    case 'grok':
    case 'deepseek':
      return data.choices[0].message.content;
    case 'ollama':
      return data.response;
    default:
      throw new Error(`不支持的API提供商: ${provider}`);
  }
}

function parseAiResponse(aiResponse: string, request: OutlineGenerationRequest): OutlineNode[] {
  try {
    // 尝试解析JSON响应
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.outline && Array.isArray(parsed.outline)) {
        return parsed.outline;
      }
    }

    // 如果JSON解析失败，生成默认结构
    return generateDefaultOutline(request);
  } catch (error) {
    console.error('解析AI响应失败:', error);
    return generateDefaultOutline(request);
  }
}

function generateDefaultOutline(request: OutlineGenerationRequest): OutlineNode[] {
  const { structure, targetWordCount, genre } = request;
  
  if (structure === 'three-act') {
    return [
      {
        id: '1',
        title: '第一幕：建立',
        description: '介绍主角、设定世界观、提出核心冲突',
        type: 'part',
        level: 1,
        order: 1,
        children: [
          {
            id: '1-1',
            title: '开场',
            description: '介绍主角的日常生活和背景',
            type: 'chapter',
            level: 2,
            order: 1,
            parentId: '1',
            children: [],
            estimatedWordCount: Math.floor(targetWordCount * 0.1),
            status: 'planned',
            notes: '',
            keyPoints: ['建立主角形象', '展示平凡世界']
          },
          {
            id: '1-2',
            title: '激励事件',
            description: '打破平衡的事件发生，推动故事发展',
            type: 'chapter',
            level: 2,
            order: 2,
            parentId: '1',
            children: [],
            estimatedWordCount: Math.floor(targetWordCount * 0.15),
            status: 'planned',
            notes: '',
            keyPoints: ['引入冲突', '改变现状']
          }
        ],
        estimatedWordCount: Math.floor(targetWordCount * 0.25),
        status: 'planned',
        notes: '',
        keyPoints: ['建立世界观', '介绍主要角色', '设置核心冲突']
      },
      {
        id: '2',
        title: '第二幕：对抗',
        description: '主角面对挑战，经历成长和变化',
        type: 'part',
        level: 1,
        order: 2,
        children: [
          {
            id: '2-1',
            title: '第一次尝试',
            description: '主角初次尝试解决问题',
            type: 'chapter',
            level: 2,
            order: 1,
            parentId: '2',
            children: [],
            estimatedWordCount: Math.floor(targetWordCount * 0.2),
            status: 'planned',
            notes: '',
            keyPoints: ['展现主角能力', '遇到阻碍']
          },
          {
            id: '2-2',
            title: '中点转折',
            description: '故事的重大转折点',
            type: 'chapter',
            level: 2,
            order: 2,
            parentId: '2',
            children: [],
            estimatedWordCount: Math.floor(targetWordCount * 0.25),
            status: 'planned',
            notes: '',
            keyPoints: ['重大发现', '改变策略']
          }
        ],
        estimatedWordCount: Math.floor(targetWordCount * 0.5),
        status: 'planned',
        notes: '',
        keyPoints: ['深化冲突', '角色成长', '情节复杂化']
      },
      {
        id: '3',
        title: '第三幕：解决',
        description: '最终对决和问题解决',
        type: 'part',
        level: 1,
        order: 3,
        children: [
          {
            id: '3-1',
            title: '最终对决',
            description: '主角与主要冲突的最终较量',
            type: 'chapter',
            level: 2,
            order: 1,
            parentId: '3',
            children: [],
            estimatedWordCount: Math.floor(targetWordCount * 0.15),
            status: 'planned',
            notes: '',
            keyPoints: ['高潮部分', '运用所学']
          },
          {
            id: '3-2',
            title: '结局',
            description: '故事的收尾和角色的最终状态',
            type: 'chapter',
            level: 2,
            order: 2,
            parentId: '3',
            children: [],
            estimatedWordCount: Math.floor(targetWordCount * 0.1),
            status: 'planned',
            notes: '',
            keyPoints: ['解决冲突', '展示成长']
          }
        ],
        estimatedWordCount: Math.floor(targetWordCount * 0.25),
        status: 'planned',
        notes: '',
        keyPoints: ['解决核心冲突', '角色完成成长', '故事收尾']
      }
    ];
  }

  // 其他结构的默认提纲可以在这里添加
  return [];
}