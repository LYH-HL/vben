// 鉴权中间件：认证（token）与授权（角色）
const { verify } = require('../utils/jwt');

// 1) 认证：请求必须携带合法 token，通过后把用户信息挂到 req.user
function auth(req, res, next) {
  // 从请求头拿 Authorization: Bearer xxx
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '').trim();

  // 没带 token = 未登录
  if (!token) {
    return res.status(401).json({ code: 1, message: '未登录' });
  }

  try {
    req.user = verify(token);
    next();
  } catch {
    // token 过期或被篡改
    return res.status(401).json({ code: 1, message: '登录已过期' });
  }
}

// 2) 授权：只有管理员能执行写操作
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== '管理员') {
    return res.status(403).json({ code: 1, message: '需要管理员权限' });
  }
  next();
}

// 3) 组合：读接口（GET/HEAD）登录即可，写接口（POST/PUT/DELETE）要求管理员
function requireAdminForWrites(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  return requireAdmin(req, res, next);
}

module.exports = { auth, requireAdmin, requireAdminForWrites };
