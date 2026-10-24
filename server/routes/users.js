// 学生路由
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

// 新增学生的初始密码（明文只出现在这里，入库前统一 bcrypt 加密）
const DEFAULT_PASSWORD = '123456';
const BCRYPT_ROUNDS = 10;

// 列表（分页 + 搜索）
router.get('/', (req, res) => {
  const _page = Number(req.query._page) || 1;
  const _limit = Number(req.query._limit) || 10;
  const q = (req.query.q || '').trim();
  let allUsers;
  if (q) {
    allUsers = db
      .prepare('SELECT * FROM users WHERE username LIKE ? OR name LIKE ? OR email LIKE ? ORDER BY id')
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

// 新增
router.post('/', (req, res) => {
  const { username, name, email, role, status, password } = req.body || {};
  if (!username || !name) return res.status(400).json({ code: 1, message: '用户名和姓名必填' });

  try {
    // 密码必须写入密文：若走表的默认值，库里会落下明文，之后 bcrypt 比对必然失败
    const hash = bcrypt.hashSync(String(password || DEFAULT_PASSWORD), BCRYPT_ROUNDS);
    const info = db
      .prepare(
        `
      INSERT INTO users (username, name, email, password, role, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        username,
        name,
        email || null,
        hash,
        role || '学生',
        status === undefined ? 1 : status ? 1 : 0,
        new Date().toISOString().slice(0, 10)
      );
    res.json({
      id: info.lastInsertRowid,
      message: password ? '新增成功' : `新增成功，初始密码 ${DEFAULT_PASSWORD}`,
    });
  } catch (error) {
    if (String(error.code).startsWith('SQLITE_CONSTRAINT')) {
      return res.status(400).json({ code: 1, message: '用户名已存在' });
    }
    throw error;
  }
});

// 编辑（不修改密码：改密码有独立入口，避免编辑表单误清空凭据）
router.put('/:id', (req, res) => {
  const { username, name, email, role, status } = req.body || {};
  if (!username || !name) return res.status(400).json({ code: 1, message: '用户名和姓名必填' });

  try {
    db.prepare('UPDATE users SET username=?, name=?, email=?, role=?, status=? WHERE id=?').run(
      username,
      name,
      email || null,
      role || '学生',
      status ? 1 : 0,
      req.params.id
    );
    res.json({ message: '更新成功' });
  } catch (error) {
    if (String(error.code).startsWith('SQLITE_CONSTRAINT')) {
      return res.status(400).json({ code: 1, message: '用户名已存在' });
    }
    throw error;
  }
});

// 删除
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ message: '删除成功' });
});

module.exports = router;
