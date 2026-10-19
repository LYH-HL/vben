// 工作台统计
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    studentCount: db.prepare('SELECT COUNT(*) AS c FROM users').get().c,
    teacherCount: db.prepare('SELECT COUNT(*) AS c FROM teachers').get().c,
    classCount: db.prepare('SELECT COUNT(*) AS c FROM classes').get().c,
    courseCount: db.prepare('SELECT COUNT(*) AS c FROM courses').get().c,
    noticeCount: db.prepare('SELECT COUNT(*) AS c FROM notices WHERE status = 1').get().c,
  });
});

module.exports = router;
