// 课程路由
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const _page = Number(req.query._page) || 1;
  const _limit = Number(req.query._limit) || 10;
  const q = (req.query.q || '').trim();
  let all;
  if (q) {
    all = db.prepare('SELECT * FROM courses WHERE name LIKE ? OR teacher LIKE ? OR class_name LIKE ? ORDER BY id')
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    all = db.prepare('SELECT * FROM courses ORDER BY id').all();
  }
  const total = all.length;
  const list = all.slice((_page - 1) * _limit, _page * _limit).map((c) => ({
    id: c.id, name: c.name, teacher: c.teacher, className: c.class_name,
    credit: c.credit, hours: c.hours, room: c.room, createdAt: c.created_at,
  }));
  res.setHeader('x-total-count', total);
  res.json(list);
});

router.post('/', (req, res) => {
  const { name, teacher, className, credit, hours, room } = req.body;
  if (!name) return res.status(400).json({ message: '课程名必填' });
  const info = db.prepare(`
    INSERT INTO courses (name, teacher, class_name, credit, hours, room, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, teacher, className, credit, hours, room, new Date().toISOString().slice(0, 10));
  res.json({ id: info.lastInsertRowid, message: '新增成功' });
});

router.put('/:id', (req, res) => {
  const { name, teacher, className, credit, hours, room } = req.body;
  db.prepare(`UPDATE courses SET name=?, teacher=?, class_name=?, credit=?, hours=?, room=? WHERE id=?`)
    .run(name, teacher, className, credit, hours, room, req.params.id);
  res.json({ message: '更新成功' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM courses WHERE id=?').run(req.params.id);
  res.json({ message: '删除成功' });
});

module.exports = router;
