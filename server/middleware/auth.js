// 鉴权中间件：拦截请求，校验 token
const { verify } = require('../utils/jwt');

module.exports = function auth(req, res, next) {
  // 从请求头拿 Authorization: Bearer xxx
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '').trim();

  // 没带 token = 未登录
  if (!token) {
    return res.status(401).json({ code: 1, message: '未登录' });
  }

  try {
    // 验证 token，把用户信息挂到 req.user 上供后面接口使用
    req.user = verify(token);
    next();
  } catch (error) {
    // token 过期或被篡改
    return res.status(401).json({ code: 1, message: '登录已过期' });
  }
};
