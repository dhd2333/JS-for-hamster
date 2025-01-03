// 1. 指定OpenAI接口地址
const BASE_URL = "https://api.openai.com/v1/chat/completions";

// 2. 写死你的OpenAI API Key 
const OPENAI_KEY = "sk-xxxxxxxxxxxxxxxxxxx";  // ← 在这里填入你的key

// 3. 其它默认参数
const DEFAULT_MODEL = "gpt-4o";
const DEFAULT_TEMPERATURE = 1.3;

// 4. 
async function chatGPTDemo(question = "你好", options = {}) {
  const {
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    // 默认判断是否简短回答（若以“-”结尾则不简短）
    isShortAnswer = !question.endsWith('-')
  } = options;

  // 构建systemPrompt
  // 如果结尾加“-”，可切换到详细回答
  const systemPrompt = `你是一位AI助手，能够回答专业且准确${
    isShortAnswer ? "，现在请尽量用一句话回答我的问题" : ""
  }`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: question }
  ];

  try {
    // 使用 $http 发请求（如果你的环境支持）
    const resp = await $http({
      url: BASE_URL,
      method: "post",
      header: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: {
        model,
        temperature,
        messages,
      },
      timeout: 30,
    });

    const statusCode = resp.response.statusCode;
    if (statusCode !== 200) {
      throw new Error(`API请求失败: HTTP状态码 ${statusCode}`);
    }

    const parsedData = JSON.parse(resp.data);
    if (!parsedData.choices || parsedData.choices.length === 0) {
      throw new Error('API返回数据格式错误: 没有找到有效的回复');
    }

    return parsedData.choices[0].message?.content || "";
  } catch (error) {
    let errorMessage = '未知错误';
    if (error instanceof SyntaxError) {
      errorMessage = 'API返回的数据无法解析为JSON';
    } else if (error.message) {
      errorMessage = error.message;
    }
    $log(`OpenAI API 错误: ${errorMessage}`);
    if (error.response) {
      $log(`响应详情: ${JSON.stringify(error.response)}`);
    }
    return `抱歉，发生了错误: ${errorMessage}`;
  }
}

// 5. 定义 output() 函数，让脚本环境可以自动调用
async function output() {
  // 从搜索框或剪贴板获取用户输入，没有则默认"你好"
  const question = $searchText || $pasteboardContent || "你好";
  return await chatGPTDemo(question);
}
