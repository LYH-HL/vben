// 登录路由
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { sign } = require('../utils/jwt');
const { verify: verifyCaptcha } = require('../utils/captcha');
const router = express.Router();

// 登录：验证码 → 查用户 → 比对密码 → 签发 token
router.post('/login', (req, res) => {
  const { username, password, captchaId, captchaCode } = req.body;

  // 1. 先校验验证码（错误/过期都返回 400，不用 401，避免前端误判为登录过期）
  if (!verifyCaptcha(captchaId, captchaCode)) {
    return res.status(400).json({ code: 1, message: '验证码错误' });
  }

  // 2. 按用户名查用户
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(400).json({ code: 1, message: '用户名或密码错误' });
  }

  // 3. 比对密码（库里存的是 bcrypt 密文）
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) {
    return res.status(400).json({ code: 1, message: '用户名或密码错误' });
  }

  // 4. 成功：签发 JWT
  res.json({
    code: 0,
    message: '登录成功',
    data: {
      accessToken: sign({ id: user.id, username: user.username }),
      username: user.username,
      realname: user.name,
    },
  });
});

module.exports = router;
