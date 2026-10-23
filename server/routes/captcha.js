// 验证码接口
const express = require('express');
const { create } = require('../utils/captcha');
const router = express.Router();

// 获取验证码图片（登录前调用，无需鉴权）
router.get('/captcha', (req, res) => {
  const { captchaId, svg } = create();
  res.json({ code: 0, message: 'ok', data: { captchaId, svg } });
});

module.exports = router;
