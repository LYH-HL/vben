// JWT 工具：签发和验证 token
const jwt = require('jsonwebtoken');

// 密钥与有效期都从环境变量读取（配置在 server/.env 里），严禁写死在代码里
const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES || '7d';

// 密钥缺失时直接拒绝启动：静默用空密钥签发，等于所有 token 都能被伪造
if (!SECRET) {
  throw new Error('缺少 JWT_SECRET：请把 server/.env.example 复制为 server/.env 并填入密钥');
}

// 签发 token（payload 是用户信息，有效期取 JWT_EXPIRES，默认 7 天）
function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

// 验证 token：合法返回解析后的内容，不合法抛异常
function verify(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { sign, verify };
