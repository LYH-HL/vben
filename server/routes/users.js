// 学生路由
const express = require('express');
const db = require('../db');
const router = express.Router();

// 列表（分页 + 搜索）
router.get('/', (req, res) => {
  const _page = Number(req.query._page) || 1;
  const _limit = Number(req.query._limit) || 10;
  const q = (req.query.q || '').trim();
  let allUsers;
  if (q) {
    allUsers = db.prepare('SELECT * FROM users WHERE username LIKE ? OR name LIKE ? OR email LIKE ? ORDER BY id')
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    allUsers = db.prepare('SELECT * FROM users ORDER BY id').all();
  }
  const total = allUsers.length;
  const start = (_page - 1) * _limit;
  const pageUsers = allUsers.slice(start, start + _limit);
  const list = pageUsers.map((u) => ({
    id: u.id, username: u.username, name: u.name, email: u.email,
    role: u.role, status: !!u.status, createdAt: u.created_at,
  }));
  res.setHeader('x-total-count', total);
  res.json(list);
});

// 新增
router.post('/', (req, res) => {
  const { username, name, email, role, status } = req.body;
  if (!username || !name) return res.status(400).json({ message: '用户名和姓名必填' });
  const info = db.prepare(`
    INSERT INTO users (username, name, email, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)
  `).run(username, name, email, role, status ? 1 : 0, new Date().toISOString().slice(0, 10));
  res.json({ id: info.lastInsertRowid, message: '新增成功' });
});

// 编辑
router.put('/:id', (req, res) => {
  const { username, name, email, role, status } = req.body;
  db.prepare(`UPDATE users SET username=?, name=?, email=?, role=?, status=? WHERE id=?`)
    .run(username, name, email, role, status ? 1 : 0, req.params.id);
  res.json({ message: '更新成功' });
});

// 删除
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ message: '删除成功' });
});

module.exports = router;
