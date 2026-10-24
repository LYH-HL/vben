// 成绩路由：课程通过 course_id 关联 courses 表，列表返回课程名
const express = require('express');
const db = require('../db');
const router = express.Router();

// 基础查询：成绩左连课程表，取课程名用于展示
const SELECT_BASE = `
  SELECT s.id, s.student_name, s.course_id, c.name AS course_name,
         s.score, s.exam_type, s.semester, s.created_at
  FROM scores s
  LEFT JOIN courses c ON c.id = s.course_id
`;

function toDto(row) {
  return {
    id: row.id,
    studentName: row.student_name,
    courseId: row.course_id,
    course: row.course_name || '未关联课程',
    score: row.score,
    examType: row.exam_type,
    semester: row.semester,
    createdAt: row.created_at,
  };
}

// 校验课程与分数，返回错误信息或 null
function validate(payload) {
  const { studentName, courseId, score } = payload;
  if (!studentName) return '学生必填';
  const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(Number(courseId));
  if (!course) return '课程必填，且必须是课程表中已存在的课程';
  const value = Number(score);
  if (!Number.isFinite(value) || value < 0 || value > 100) return '分数必须是 0-100 之间的数字';
  return null;
}

// 列表（支持按学生筛选、按关键词搜索）
router.get('/', (req, res) => {
  const _page = Number(req.query._page) || 1;
  const _limit = Number(req.query._limit) || 100;
  const q = (req.query.q || '').trim();
  const student = (req.query.student || '').trim();

  let rows;
  if (student) {
    rows = db.prepare(`${SELECT_BASE} WHERE s.student_name = ? ORDER BY c.name`).all(student);
  } else if (q) {
    rows = db
      .prepare(`${SELECT_BASE} WHERE s.student_name LIKE ? OR c.name LIKE ? ORDER BY s.id`)
      .all(`%${q}%`, `%${q}%`);
  } else {
    rows = db.prepare(`${SELECT_BASE} ORDER BY s.student_name, s.id`).all();
  }

  const total = rows.length;
  const list = rows.slice((_page - 1) * _limit, _page * _limit).map(toDto);
  res.setHeader('x-total-count', total);
  res.json(list);
});

// 新增
router.post('/', (req, res) => {
  const body = req.body || {};
  const invalid = validate(body);
  if (invalid) return res.status(400).json({ code: 1, message: invalid });

  const info = db
    .prepare(
      `
    INSERT INTO scores (student_name, course_id, score, exam_type, semester, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `
    )
    .run(
      body.studentName,
      Number(body.courseId),
      Number(body.score),
      body.examType || '期末',
      body.semester || '2026秋',
      new Date().toISOString().slice(0, 10)
    );
  res.json({ id: info.lastInsertRowid, message: '新增成功' });
});

// 编辑
router.put('/:id', (req, res) => {
  const body = req.body || {};
  const invalid = validate(body);
  if (invalid) return res.status(400).json({ code: 1, message: invalid });

  db.prepare(
    `
    UPDATE scores SET student_name = ?, course_id = ?, score = ?, exam_type = ?, semester = ? WHERE id = ?
  `
  ).run(
    body.studentName,
    Number(body.courseId),
    Number(body.score),
    body.examType || '期末',
    body.semester || '2026秋',
    req.params.id
  );
  res.json({ message: '更新成功' });
});

// 删除
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM scores WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

module.exports = router;
