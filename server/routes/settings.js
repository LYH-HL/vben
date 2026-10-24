// 系统设置路由：全库只有一行配置（id = 1）
const express = require('express');
const db = require('../db');
const router = express.Router();

const DEFAULTS = {
  siteName: '智慧校园管理系统',
  description: '面向中小学的教务管理后台',
  email: 'admin@example.com',
  darkMode: false,
};

// 保证配置行存在，首次访问时按默认值初始化
function ensureRow() {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  if (row) return row;
  db.prepare(
    'INSERT INTO settings (id, site_name, description, email, dark_mode) VALUES (1, ?, ?, ?, ?)'
  ).run(DEFAULTS.siteName, DEFAULTS.description, DEFAULTS.email, DEFAULTS.darkMode ? 1 : 0);
  return db.prepare('SELECT * FROM settings WHERE id = 1').get();
}

function toDto(row) {
  return {
    siteName: row.site_name,
    description: row.description,
    email: row.email,
    darkMode: !!row.dark_mode,
  };
}

// 读取配置
router.get('/', (req, res) => {
  res.json(toDto(ensureRow()));
});

// 保存配置
router.put('/', (req, res) => {
  const { siteName, description, email, darkMode } = req.body || {};
  ensureRow();
  db.prepare('UPDATE settings SET site_name = ?, description = ?, email = ?, dark_mode = ? WHERE id = 1').run(
    siteName === undefined ? DEFAULTS.siteName : String(siteName),
    description === undefined ? '' : String(description),
    email === undefined ? '' : String(email),
    darkMode ? 1 : 0
  );
  res.json({ message: '保存成功', data: toDto(ensureRow()) });
});

module.exports = router;
