import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 获取API设置
    const apiProvider = request.headers.get('x-api-provider') || 'openai';
    const apiKey = request.headers.get('x-api-key');
    const model = request.headers.get('x-model') || 'gpt-3.5-turbo';
    const baseUrl = request.headers.get('x-base-url');

    if (!apiKey) {
      return NextResponse.json({ error: 'API密钥未设置' }, { status: 400 });
    }

    // 构建提示词
    const prompt = buildChapterPrompt(body);

    // 调用AI API
    const aiResponse = await callAiApi({
      provider: apiProvider,
      apiKey,
      model,
      baseUrl,
      prompt
    });

    return NextResponse.json({
      content: aiResponse,
      summary: `生成了${body.targetWordCount}字左右的章节内容`
    });

  } catch (error) {
    console.error('生成章节错误:', error);
    return NextResponse.json(
      { error: '生成章节失败，请检查API设置和网络连接' },
      { status: 500 }
    );
  }
}

function buildChapterPrompt(request: any): string {
  const styleGuide = {
    'narrative': '以叙述为主，注重情节推进和场景描写',
    'dialogue': '以对话为主，通过角色对话推动情节发展',
    'descriptive': '注重环境和人物的细致描写，营造氛围',
    'action': '动作场面为主，节奏紧凑，充满张力',
    'introspective': '注重角色内心活动和心理描写',
    'mixed': '综合运用多种写作技巧，灵活变换风格'
  };

  return `请根据以下要求创作一个章节：

章节标题：${request.chapterTitle}
章节顺序：第${request.chapterOrder}章
目标字数：${request.targetWordCount}字
写作风格：${styleGuide[request.writingStyle] || '叙述性'}

情节概要：${request.plotSummary}

详细设定：
- 主要角色：${request.characters || '未指定'}
- 场景设定：${request.setting || '未指定'}
- 情感基调：${request.mood || '未指定'}
- 关键事件：${request.keyEvents || '未指定'}

上下文信息：
${request.previousChapterSummary ? `前章节概要：${request.previousChapterSummary}` : ''}
${request.nextChapterHint ? `下章节提示：${request.nextChapterHint}` : ''}

创作要求：
1. 严格按照目标字数创作，误差不超过10%
2. 体现指定的写作风格和情感基调
3. 确保情节连贯，与前后章节呼应
4. 角色行为符合人物设定
5. 场景描写生动具体
6. 对话自然流畅
7. 适当运用文学技巧增强表现力

请直接输出章节内容，不要包含其他说明文字。`;
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
        temperature: 0.8,
        max_tokens: 4000
      };
      break;

    case 'grok':
      apiUrl = baseUrl || 'https://api.x.ai/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 4000
      };
      break;

    case 'deepseek':
      apiUrl = baseUrl || 'https://api.deepseek.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
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