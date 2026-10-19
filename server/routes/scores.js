// 成绩路由（只读，支持按学生筛选）
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const _page = Number(req.query._page) || 1;
  const _limit = Number(req.query._limit) || 100;
  const q = (req.query.q || '').trim();
  const student = (req.query.student || '').trim();
  let all;
  if (student) {
    all = db.prepare('SELECT * FROM scores WHERE student_name = ? ORDER BY course').all(student);
  } else if (q) {
    all = db.prepare('SELECT * FROM scores WHERE student_name LIKE ? OR course LIKE ? ORDER BY id')
      .all(`%${q}%`, `%${q}%`);
  } else {
    all = db.prepare('SELECT * FROM scores ORDER BY student_name, id').all();
  }
  const total = all.length;
  const list = all.slice((_page - 1) * _limit, _page * _limit).map((s) => ({
    id: s.id, studentName: s.student_name, course: s.course, score: s.score,
    examType: s.exam_type, semester: s.semester, createdAt: s.created_at,
  }));
  res.setHeader('x-total-count', total);
  res.json(list);
});

module.exports = router;
