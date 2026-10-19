// 登录路由
const express = require('express');
const db = require('../db');
const router = express.Router();

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (!user) {
    return res.status(401).json({ code: 1, message: '用户名或密码错误' });
  }
  res.json({
    code: 0,
    message: '登录成功',
    data: {
      accessToken: 'token-' + Date.now(),
      username: user.username,
      realname: user.name,
    },
  });
});

module.exports = router;
