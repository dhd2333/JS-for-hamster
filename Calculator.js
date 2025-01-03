/**
 * calculateExpression(expr):
 *  - 计算传入的字符串表达式。
 *  - 支持：加减乘除、括号、百分号(% -> 除以100)、幂运算(^ -> Math.pow)、常量(pi/e)、常见函数(sin/cos/tan/asin/acos/atan/sqrt/log/ln/deg/rad)。
 */
function calculateExpression(expr) {
  try {
    // 1) 做初步字符校验，只允许数字、空格、+-*/^%.() e pi sin cos tan asin acos atan sqrt log ln deg rad
    if (!/^[\d\s+\-*/^%.()e\p{L}]+$/iu.test(expr)) {
      return "表达式包含不支持的字符";
    }

    let input = expr.trim().toLowerCase();

    // 2) 处理百分号 (50% -> 0.5)
    input = input.replace(/(\d+(\.\d+)?)%/g, (match, p1) => {
      const val = parseFloat(p1);
      return String(val / 100);
    });

    // 3) 替换数学常量和函数，转成 JS 内置 Math.xx
    const replacements = [
      { from: /\bpi\b/g,        to: 'Math.PI' },
      { from: /\be\b/g,         to: 'Math.E'  },
      { from: /\bsin\(/g,       to: 'Math.sin('  },
      { from: /\bcos\(/g,       to: 'Math.cos('  },
      { from: /\btan\(/g,       to: 'Math.tan('  },
      { from: /\basin\(/g,      to: 'Math.asin(' },
      { from: /\bacos\(/g,      to: 'Math.acos(' },
      { from: /\batan\(/g,      to: 'Math.atan(' },
      { from: /\bsqrt\(/g,      to: 'Math.sqrt(' },
      // log(...) -> Math.log10(...)
      { from: /\blog\(/g,       to: 'Math.log10(' },
      // ln(...)  -> Math.log(...)
      { from: /\bln\(/g,        to: 'Math.log('   },
      // deg(x)   -> (180/Math.PI)*x
      { from: /\bdeg\(/g,       to: '(180/Math.PI)*(' },
      // rad(x)   -> (Math.PI/180)*x
      { from: /\brad\(/g,       to: '(Math.PI/180)*(' },
    ];
    for (const rule of replacements) {
      input = input.replace(rule.from, rule.to);
    }

    // 4) 幂运算：将 a ^ b -> Math.pow(a, b)
    //   用 while+正则，逐个替换所有 ^ 出现
    while (/\^/.test(input)) {
      input = input.replace(
        /(\d+(?:\.\d+)?|\([^()]*\)|Math\.\w+\([^()]*\))\s*\^\s*(\d+(?:\.\d+)?|\([^()]*\)|Math\.\w+\([^()]*\))/,
        (match, base, exponent) => `Math.pow(${base},${exponent})`
      );
    }

    // 5) 通过 new Function() 来执行
    const resultFn = new Function(`"use strict"; return (${input});`);
    const result = resultFn();

    // 6) 检查结果是否有效
    if (typeof result !== 'number' || !isFinite(result)) {
      return "结果超出计算范围或不是数值";
    }

    // 7) 处理小数精度，保留最多 10 位小数
    const finalStr = result.toFixed(10).replace(/\.?0+$/, '');
    return finalStr;

  } catch (error) {
    return "表达式错误：" + error.message;
  }
}

/**
 * output():
 *  - 脚本环境会自动调用此函数并获取返回值
 *  - 从 $searchText 或 $pasteboardContent 中获取用户输入
 *  - 如果两者都为空，则默认计算 "2^3 + 50%" (即结果 8.5)
 */
async function output() {
  // 和 GPT 脚本一样，优先从 $searchText / $pasteboardContent 获取输入
  // 你的环境若确实支持这些变量，就可以直接获取
  // 如果都没有，就默认 "2^3 + 50%"
  const expr = $searchText || $pasteboardContent || "2^3 + 50%";
  
  // 调用计算函数
  const result = calculateExpression(expr);

  // 最终返回到脚本环境
  return result;
}
