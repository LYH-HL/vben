// 登录路由
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { sign } = require('../utils/jwt');
const router = express.Router();

// 登录：先用用户名查库，再用 bcrypt 比对密码
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 1. 按用户名查用户（不再直接拼密码查询）
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ code: 1, message: '用户名或密码错误' });
  }

  // 2. 比对密码（库里存的是 bcrypt 加密后的密文，compareSync 校验）
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) {
    return res.status(401).json({ code: 1, message: '用户名或密码错误' });
  }

  // 3. 登录成功，签发真正的 JWT token（7 天有效，配置在 .env）
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
