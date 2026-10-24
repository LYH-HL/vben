// 教师路由
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const _page = Number(req.query._page) || 1;
  const _limit = Number(req.query._limit) || 10;
  const q = (req.query.q || '').trim();
  let all;
  if (q) {
    all = db
      .prepare('SELECT * FROM teachers WHERE username LIKE ? OR name LIKE ? OR subject LIKE ? ORDER BY id')
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    all = db.prepare('SELECT * FROM teachers ORDER BY id').all();
  }
  const total = all.length;
  const list = all.slice((_page - 1) * _limit, _page * _limit).map((t) => ({
    id: t.id,
    username: t.username,
    name: t.name,
    email: t.email,
    subject: t.subject,
    title: t.title,
    status: !!t.status,
    createdAt: t.created_at,
  }));
  res.setHeader('x-total-count', total);
  res.json(list);
});

router.post('/', (req, res) => {
  const { username, name, email, subject, title, status } = req.body;
  if (!username || !name) return res.status(400).json({ message: '用户名和姓名必填' });
  const info = db
    .prepare(
      `
    INSERT INTO teachers (username, name, email, subject, title, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)
  `
    )
    .run(username, name, email, subject, title, status ? 1 : 0, new Date().toISOString().slice(0, 10));
  res.json({ id: info.lastInsertRowid, message: '新增成功' });
});

router.put('/:id', (req, res) => {
  const { username, name, email, subject, title, status } = req.body;
  db.prepare(`UPDATE teachers SET username=?, name=?, email=?, subject=?, title=?, status=? WHERE id=?`).run(
    username,
    name,
    email,
    subject,
    title,
    status ? 1 : 0,
    req.params.id
  );
  res.json({ message: '更新成功' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM teachers WHERE id=?').run(req.params.id);
  res.json({ message: '删除成功' });
});

module.exports = router;
