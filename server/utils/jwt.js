// JWT 工具：签发和验证 token
const jwt = require('jsonwebtoken');
// 密钥从环境变量读取（配置在 server/.env 里），严禁写死在代码里
const SECRET = process.env.JWT_SECRET;
// 签发 token（payload 是用户信息，7 天过期）
function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}
// 验证 token：合法返回解析后的内容，不合法抛异常
function verify(token) {
  return jwt.verify(token, SECRET);
}
module.exports = { sign, verify };
