// 通知路由
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
      .prepare('SELECT * FROM notices WHERE title LIKE ? OR publisher LIKE ? OR type LIKE ? ORDER BY id DESC')
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    all = db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
  }
  const total = all.length;
  const list = all.slice((_page - 1) * _limit, _page * _limit).map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    publisher: n.publisher,
    type: n.type,
    status: !!n.status,
    createdAt: n.created_at,
  }));
  res.setHeader('x-total-count', total);
  res.json(list);
});

router.post('/', (req, res) => {
  const { title, content, publisher, type, status } = req.body;
  if (!title) return res.status(400).json({ message: '标题必填' });
  const info = db
    .prepare(
      `
    INSERT INTO notices (title, content, publisher, type, status, created_at) VALUES (?, ?, ?, ?, ?, ?)
  `
    )
    .run(title, content, publisher, type, status ? 1 : 0, new Date().toISOString().slice(0, 10));
  res.json({ id: info.lastInsertRowid, message: '新增成功' });
});

router.put('/:id', (req, res) => {
  const { title, content, publisher, type, status } = req.body;
  db.prepare(`UPDATE notices SET title=?, content=?, publisher=?, type=?, status=? WHERE id=?`).run(
    title,
    content,
    publisher,
    type,
    status ? 1 : 0,
    req.params.id
  );
  res.json({ message: '更新成功' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM notices WHERE id=?').run(req.params.id);
  res.json({ message: '删除成功' });
});

module.exports = router;
