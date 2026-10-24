// 登录路由
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { sign } = require('../utils/jwt');
const { verify: verifyCaptcha } = require('../utils/captcha');
const { createLimiter } = require('../utils/ratelimit');
const router = express.Router();

// 同一 IP 5 分钟内最多尝试 10 次，防暴力破解
const loginLimiter = createLimiter({ max: 10, windowMs: 5 * 60 * 1000 });

// 登录：限流 → 验证码 → 查用户 → 比对密码 → 校验状态 → 签发 token
router.post('/login', loginLimiter, (req, res) => {
  const { username, password, captchaId, captchaCode } = req.body || {};

  // 1. 先校验验证码（错误/过期都返回 400，不用 401，避免前端误判为登录过期）
  if (!verifyCaptcha(captchaId, captchaCode)) {
    return res.status(400).json({ code: 1, message: '验证码错误' });
  }

  // 2. 按用户名查用户
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(String(username || ''));
  if (!user) {
    return res.status(400).json({ code: 1, message: '用户名或密码错误' });
  }

  // 3. 比对密码（库里存的是 bcrypt 密文）
  const ok = bcrypt.compareSync(String(password || ''), user.password);
  if (!ok) {
    return res.status(400).json({ code: 1, message: '用户名或密码错误' });
  }

  // 4. 状态校验放在密码之后：不让未通过身份验证的人试出哪个账号被停用
  if (!user.status) {
    return res.status(403).json({ code: 1, message: '账号已停用，请联系管理员' });
  }

  // 5. 成功：签发 JWT，payload 带角色，供后端做写权限校验
  res.json({
    code: 0,
    message: '登录成功',
    data: {
      accessToken: sign({ id: user.id, username: user.username, role: user.role }),
      username: user.username,
      realname: user.name,
      role: user.role,
    },
  });
});

module.exports = router;
