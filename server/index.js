// 入口：加载配置 → 建库 → 挂载路由
const path = require('path');
// .env 固定在 server/ 目录：从别的当前目录启动时也能读到配置
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const cors = require('cors');
require('./db');
const { auth, requireAdminForWrites } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// 允许的来源白名单，默认只放开本地前端（Vite 的 5173）
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // 无 Origin 的请求（curl、同源、桌面客户端）放行；其余必须在白名单内
      callback(null, !origin || ALLOWED_ORIGINS.includes(origin));
    },
    exposedHeaders: ['x-total-count'],
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/hello', (req, res) => {
  res.json({ message: '后端跑起来了！', time: new Date().toLocaleString() });
});

// 公开接口：验证码与登录
app.use('/api', require('./routes/captcha'));
app.use('/api', require('./routes/auth'));

// 业务接口：登录即可读，写操作（POST/PUT/DELETE）要求管理员
app.use('/api/users', auth, requireAdminForWrites, require('./routes/users'));
app.use('/api/teachers', auth, requireAdminForWrites, require('./routes/teachers'));
app.use('/api/classes', auth, requireAdminForWrites, require('./routes/classes'));
app.use('/api/courses', auth, requireAdminForWrites, require('./routes/courses'));
app.use('/api/scores', auth, requireAdminForWrites, require('./routes/scores'));
app.use('/api/notices', auth, requireAdminForWrites, require('./routes/notices'));
app.use('/api/stats', auth, requireAdminForWrites, require('./routes/stats'));
app.use('/api/settings', auth, requireAdminForWrites, require('./routes/settings'));

// 未匹配的 /api 路由统一返回 JSON，避免前端拿到 HTML 错误页
app.use('/api', (req, res) => {
  res.status(404).json({ code: 1, message: `接口不存在：${req.method} ${req.originalUrl}` });
});

// 统一错误处理：请求体解析失败、数据库约束冲突等都以 JSON 返回，不泄漏堆栈
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ code: 1, message: '请求体不是合法的 JSON' });
  }
  console.error('[server error]', err);
  res.status(500).json({ code: 1, message: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`后端启动：http://localhost:${PORT}`);
});
