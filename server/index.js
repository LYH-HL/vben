// 后端入口：Express
const express = require('express');
const cors = require('cors');
require('./db'); // 初始化数据库
const app = express();
const PORT = 3001;

app.use(cors({ exposedHeaders: ['x-total-count'] }));
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: '后端跑起来了！', time: new Date().toLocaleString() });
});

// 挂载路由
app.use('/api/users', require('./routes/users'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api', require('./routes/auth'));


app.listen(PORT, () => {
  console.log(`后端启动：http://localhost:${PORT}`);
});

