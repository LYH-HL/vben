// 后端入口：Express + SQLite
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors({
  exposedHeaders: ['x-total-count'],
}));

app.use(express.json());

// ===== 1. 连接 SQLite 数据库 =====
// 数据库文件放在 server/data/school.db（文件夹不存在会自动建）
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'school.db'));

// ===== 2. 建表（如果不存在）=====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    name TEXT,
    email TEXT,
    role TEXT,
    status INTEGER DEFAULT 1,
    created_at TEXT
  )
`);

// ===== 3. 表是空的就插入初始学生数据 =====
const rowCount = db.prepare('SELECT COUNT(*) AS c FROM users').get();
if (rowCount.c === 0) {
  const insert = db.prepare(`
    INSERT INTO users (username, name, email, role, status, created_at)
    VALUES (@username, @name, @email, @role, @status, @created_at)
  `);
  const students = [
    { username: 'wangmeng', name: '王萌', email: 'wangmeng@example.com', role: '管理员', status: 1, created_at: '2026-09-01' },
    { username: 'zhangyuxin', name: '张雨欣', email: 'zhangyuxin@example.com', role: '学生', status: 1, created_at: '2026-09-02' },
    { username: 'lihao', name: '李浩', email: 'lihao@example.com', role: '学生', status: 0, created_at: '2026-09-03' },
    { username: 'chenmengqi', name: '陈梦琪', email: 'chenmengqi@example.com', role: '学生', status: 1, created_at: '2026-09-04' },
    { username: 'liuyang', name: '刘洋', email: 'liuyang@example.com', role: '学生', status: 1, created_at: '2026-09-05' },
    { username: 'wanghaoyu', name: '王浩宇', email: 'wanghaoyu@example.com', role: '学生', status: 0, created_at: '2026-09-06' },
    { username: 'zhaolei', name: '赵磊', email: 'zhaolei@example.com', role: '学生', status: 1, created_at: '2026-09-07' },
    { username: 'sunjiayi', name: '孙佳怡', email: 'sunjiayi@example.com', role: '学生', status: 1, created_at: '2026-09-08' },
    { username: 'zhouxiaotong', name: '周晓彤', email: 'zhouxiaotong@example.com', role: '学生', status: 0, created_at: '2026-09-09' },
    { username: 'wujie', name: '吴杰', email: 'wujie@example.com', role: '学生', status: 1, created_at: '2026-09-10' },
    { username: 'linjia', name: '林佳', email: 'linjia@example.com', role: '学生', status: 1, created_at: '2026-09-11' },
    { username: 'xuwenbo', name: '许文博', email: 'xuwenbo@example.com', role: '学生', status: 1, created_at: '2026-09-12' },
  ];
  for (const s of students) insert.run(s);
  console.log('已插入初始学生数据：12 条');
}

// ===== 4. 接口 =====
// 测试接口
app.get('/api/hello', (req, res) => {
  res.json({ message: '后端跑起来了！', time: new Date().toLocaleString() });
});

// 获取学生列表（支持分页 _page/_limit 和搜索 q）
app.get('/api/users', (req, res) => {
  const _page = Number(req.query._page) || 1;
  const _limit = Number(req.query._limit) || 10;
  const q = (req.query.q || '').trim();

  let allUsers;
  if (q) {
    allUsers = db
      .prepare(
        'SELECT * FROM users WHERE username LIKE ? OR name LIKE ? OR email LIKE ? ORDER BY id'
      )
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    allUsers = db.prepare('SELECT * FROM users ORDER BY id').all();
  }

  const total = allUsers.length;
  const start = (_page - 1) * _limit;
  const pageUsers = allUsers.slice(start, start + _limit);

  const list = pageUsers.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    role: u.role,
    status: !!u.status,
    createdAt: u.created_at,
  }));

  res.setHeader('x-total-count', total);
  res.json(list);
});


// ===== 5. 启动服务 =====
app.listen(PORT, () => {
  console.log(`后端启动：http://localhost:${PORT}`);
});
