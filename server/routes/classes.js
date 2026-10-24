// 班级路由
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
      .prepare('SELECT * FROM classes WHERE name LIKE ? OR grade LIKE ? OR head_teacher LIKE ? ORDER BY id')
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    all = db.prepare('SELECT * FROM classes ORDER BY id').all();
  }
  const total = all.length;
  const list = all.slice((_page - 1) * _limit, _page * _limit).map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    headTeacher: c.head_teacher,
    studentCount: c.student_count,
    room: c.room,
    createdAt: c.created_at,
  }));
  res.setHeader('x-total-count', total);
  res.json(list);
});

router.post('/', (req, res) => {
  const { name, grade, headTeacher, studentCount, room } = req.body;
  if (!name) return res.status(400).json({ message: '班级名必填' });
  const info = db
    .prepare(
      `
    INSERT INTO classes (name, grade, head_teacher, student_count, room, created_at) VALUES (?, ?, ?, ?, ?, ?)
  `
    )
    .run(name, grade, headTeacher, studentCount || 0, room, new Date().toISOString().slice(0, 10));
  res.json({ id: info.lastInsertRowid, message: '新增成功' });
});

router.put('/:id', (req, res) => {
  const { name, grade, headTeacher, studentCount, room } = req.body;
  db.prepare(`UPDATE classes SET name=?, grade=?, head_teacher=?, student_count=?, room=? WHERE id=?`).run(
    name,
    grade,
    headTeacher,
    studentCount || 0,
    room,
    req.params.id
  );
  res.json({ message: '更新成功' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM classes WHERE id=?').run(req.params.id);
  res.json({ message: '删除成功' });
});

module.exports = router;
