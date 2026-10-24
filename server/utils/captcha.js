// 验证码工具：生成 + 存储 + 校验
// 存储方案：内存 Map（key=验证码ID，value={文字, 过期时间}）
const svgCaptcha = require('svg-captcha');

// 验证码有效期：5 分钟
const EXPIRE_MS = 5 * 60 * 1000;

// 内存存储：captchaId -> { text, expiresAt }
const store = new Map();

// 生成验证码：返回 captchaId + svg 图片
function create() {
  const captcha = svgCaptcha.create({
    size: 4, // 4 位字符
    noise: 3, // 干扰线数量
    color: true, // 彩色
    ignoreChars: '0o1ilI', // 去掉容易看混的字符
  });
  const captchaId = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  store.set(captchaId, {
    text: captcha.text.toLowerCase(),
    expiresAt: Date.now() + EXPIRE_MS,
  });
  return { captchaId, svg: captcha.data };
}

// 校验验证码：用完立即删除（一次性，防重复使用）
function verify(captchaId, code) {
  if (!captchaId || !code) return false;
  const item = store.get(captchaId);
  if (!item) return false;
  store.delete(captchaId); // 无论对错，用一次就作废
  if (Date.now() > item.expiresAt) return false; // 超过 5 分钟作废
  return item.text === code.toLowerCase().trim(); // 忽略大小写
}

// 定期清理过期验证码，防止内存堆积（每 10 分钟清一次）
setInterval(
  () => {
    const now = Date.now();
    for (const [id, item] of store) {
      if (now > item.expiresAt) store.delete(id);
    }
  },
  10 * 60 * 1000
);

module.exports = { create, verify };
