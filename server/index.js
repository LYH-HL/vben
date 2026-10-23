require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./db');
const auth = require('./middleware/auth');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ exposedHeaders: ['x-total-count'] }));
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: '后端跑起来了！', time: new Date().toLocaleString() });
});

app.use('/api', require('./routes/auth'));

app.use('/api/users', auth, require('./routes/users'));
app.use('/api/teachers', auth, require('./routes/teachers'));
app.use('/api/classes', auth, require('./routes/classes'));
app.use('/api/courses', auth, require('./routes/courses'));
app.use('/api/scores', auth, require('./routes/scores'));
app.use('/api/notices', auth, require('./routes/notices'));
app.use('/api/stats', auth, require('./routes/stats'));

app.listen(PORT, () => {
  console.log(`后端启动：http://localhost:${PORT}`);
});
