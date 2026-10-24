// 接口集成测试：一条命令验证后端主要行为。
//
// 设计要点：
//  - 用独立数据库（DB_FILE 指向 .tmp-api-test/），绝不碰 server/data/school.db
//  - 验证码校验只在测试进程内被替换，生产代码零改动
//  - 全程真实 HTTP，不 mock
//
// 用法：pnpm test:api            （可用 TEST_PORT 指定端口，默认 3101）
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

const PORT = Number(process.env.TEST_PORT || 3101);
const BASE = `http://127.0.0.1:${PORT}/api`;

// ---------- 1. 独立测试库 ----------
const tmpDir = path.join(root, '.tmp-api-test');
rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
process.env.DB_FILE = path.join(tmpDir, 'test.db');
process.env.PORT = String(PORT);

// ---------- 2. 测试态验证码：只有 'test' 通过 ----------
// 这样既能测登录成功，也能测「验证码错误」这条分支
const captcha = require(path.join(root, 'server', 'utils', 'captcha.js'));
captcha.verify = (_captchaId, code) => code === 'test';

// ---------- 3. 启动真实服务 ----------
try {
  require(path.join(root, 'server', 'index.js'));
} catch (error) {
  console.error('服务启动失败：' + error.message);
  console.error('提示：请确认已复制 server/.env.example 为 server/.env 并填写 JWT_SECRET');
  process.exit(1);
}

// ---------- 断言与请求工具 ----------
let passed = 0;
const failures = [];

function check(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failures.push(name);
    console.log(`  FAIL  ${name}${detail ? '  -->  ' + detail : ''}`);
  }
}

async function req(method, pathname, body, token) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // 非 JSON 响应（例如 HTML 错误页）保留原文用于断言
  }
  return { status: res.status, json, text, headers: res.headers };
}

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`${BASE}/hello`);
      if (res.ok) return true;
    } catch {
      // 还没起来
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
}

// ---------- 用例 ----------
async function runTests() {
  console.log('\n[认证]');
  let r = await req('GET', '/hello');
  check('健康检查返回 200', r.status === 200);

  r = await req('GET', '/captcha');
  check('验证码接口返回 svg 与 captchaId', r.status === 200 && r.json?.data?.svg?.length > 50);

  r = await req('POST', '/login', {
    username: 'wangmeng',
    password: 'admin123',
    captchaId: 'x',
    captchaCode: 'test',
  });
  const adminToken = r.json?.data?.accessToken;
  check('管理员登录成功且返回 role', r.status === 200 && r.json?.data?.role === '管理员' && !!adminToken);

  r = await req('POST', '/login', {
    username: 'wangmeng',
    password: 'admin123',
    captchaId: 'x',
    captchaCode: 'bad',
  });
  check('验证码错误返回 400', r.status === 400 && r.json?.message === '验证码错误');

  r = await req('POST', '/login', {
    username: 'wangmeng',
    password: 'wrong',
    captchaId: 'x',
    captchaCode: 'test',
  });
  check('密码错误返回 400', r.status === 400);

  r = await req('POST', '/login', {
    username: 'lihao',
    password: '123456',
    captchaId: 'x',
    captchaCode: 'test',
  });
  check('停用账号登录返回 403', r.status === 403 && /停用/.test(r.json?.message || ''));

  console.log('\n[鉴权与授权]');
  r = await req('GET', '/users');
  check('无 token 访问受保护接口返回 401', r.status === 401);

  r = await req('GET', '/users?_page=1&_limit=5', undefined, adminToken);
  check(
    '管理员读列表 200 且带 x-total-count',
    r.status === 200 && Number(r.headers.get('x-total-count')) === 12
  );

  r = await req('POST', '/login', {
    username: 'zhangyuxin',
    password: '123456',
    captchaId: 'x',
    captchaCode: 'test',
  });
  const stuToken = r.json?.data?.accessToken;
  check('学生登录成功且 role=学生', r.status === 200 && r.json?.data?.role === '学生');

  r = await req('POST', '/users', { username: 'hack', name: '越权' }, stuToken);
  check('学生执行写操作返回 403', r.status === 403);

  r = await req('GET', '/users?_limit=1', undefined, stuToken);
  check('学生仍可读列表', r.status === 200);

  console.log('\n[学生管理]');
  const newName = 'stu_test_' + Math.floor(Math.random() * 10000);
  r = await req(
    'POST',
    '/users',
    { username: newName, name: '测试生', email: 't@example.com', role: '学生', status: true },
    adminToken
  );
  const createdId = r.json?.id;
  check('新增学生成功并提示初始密码', r.status === 200 && /初始密码/.test(r.json?.message || ''));

  r = await req('POST', '/login', {
    username: newName,
    password: '123456',
    captchaId: 'x',
    captchaCode: 'test',
  });
  check('新增学生可用默认密码登录', r.status === 200);

  r = await req('POST', '/users', { username: newName, name: '重名' }, adminToken);
  check('用户名重复返回 400', r.status === 400);

  r = await req('DELETE', `/users/${createdId}`, undefined, adminToken);
  check('删除学生成功', r.status === 200);

  console.log('\n[系统设置]');
  r = await req('GET', '/settings', undefined, adminToken);
  const origin = r.json;
  check('读取设置返回 siteName', r.status === 200 && !!origin?.siteName);

  r = await req(
    'PUT',
    '/settings',
    { siteName: '测试站点', description: 'd', email: 'e@x.com', darkMode: true },
    adminToken
  );
  check('管理员保存设置成功', r.status === 200);

  r = await req('GET', '/settings', undefined, adminToken);
  check('保存后读回是新值', r.json?.siteName === '测试站点' && r.json?.darkMode === true);

  r = await req('PUT', '/settings', { siteName: 'x' }, stuToken);
  check('学生保存设置返回 403', r.status === 403);

  await req('PUT', '/settings', origin, adminToken); // 还原

  console.log('\n[成绩（课程外键）]');
  r = await req('GET', `/scores?student=${encodeURIComponent('王萌')}`, undefined, adminToken);
  const rows = r.json || [];
  check('按学生查询返回 6 条', rows.length === 6);
  check(
    '每行都带 courseId',
    rows.every((x) => x.courseId)
  );

  r = await req('GET', '/courses?_limit=100', undefined, adminToken);
  const courseIds = (r.json || []).map((x) => x.id);
  check(
    '成绩的 courseId 都能对上课程表',
    rows.every((x) => courseIds.includes(x.courseId))
  );
  check(
    '课程名来自课程表（含「高等数学」）',
    rows.some((x) => x.course === '高等数学')
  );

  const cid = courseIds[0];
  r = await req(
    'POST',
    '/scores',
    { studentName: '王萌', courseId: cid, score: 91, examType: '期末', semester: '2026秋' },
    adminToken
  );
  const scoreId = r.json?.id;
  check('录入成绩成功', r.status === 200 && !!scoreId);

  r = await req('POST', '/scores', { studentName: '王萌', courseId: 99999, score: 80 }, adminToken);
  check('不存在的 courseId 返回 400', r.status === 400);

  r = await req('POST', '/scores', { studentName: '王萌', course: '数学', score: 80 }, adminToken);
  check('旧的 course 文本字段被拒', r.status === 400);

  r = await req('POST', '/scores', { studentName: '王萌', courseId: cid, score: 150 }, adminToken);
  check('分数越界返回 400', r.status === 400);

  r = await req(
    'PUT',
    `/scores/${scoreId}`,
    { studentName: '王萌', courseId: cid, score: 77, examType: '期中', semester: '2026秋' },
    adminToken
  );
  check('编辑成绩成功', r.status === 200);

  r = await req('DELETE', `/scores/${scoreId}`, undefined, adminToken);
  check('删除成绩成功', r.status === 200);

  r = await req('GET', '/scores?_limit=100', undefined, adminToken);
  check('成绩总数回到 72', Number(r.headers.get('x-total-count')) === 72);

  console.log('\n[错误处理]');
  r = await req('GET', '/nope');
  check('未知接口返回 JSON 404', r.status === 404 && typeof r.json?.code === 'number');

  r = await req('POST', '/login', '{bad json');
  check('非法 JSON 返回 400 JSON', r.status === 400 && typeof r.json?.code === 'number');

  console.log('\n[登录限流]（最后执行）');
  let last = 0;
  for (let i = 0; i < 14; i += 1) {
    r = await req('POST', '/login', {
      username: 'wangmeng',
      password: 'admin123',
      captchaId: 'x',
      captchaCode: 'test',
    });
    last = r.status;
    if (last === 429) break;
  }
  check('连续登录触发 429', last === 429);
}

// ---------- 执行 ----------
const ready = await waitForServer();
if (!ready) {
  console.error('服务在 12 秒内未就绪，测试中止');
  process.exit(1);
}

try {
  await runTests();
} catch (error) {
  console.error('测试执行异常：' + error.message);
  failures.push('执行异常');
}

console.log(`\n==== 通过 ${passed} 项，失败 ${failures.length} 项 ====`);
if (failures.length) console.log('失败用例：' + failures.join('、'));

// 先关掉数据库连接，否则 Windows 上文件仍被占用、删不掉
try {
  require(path.join(root, 'server', 'db.js')).close();
} catch {
  // 忽略：进程马上退出
}
try {
  rmSync(tmpDir, { recursive: true, force: true });
} catch {
  console.log('提示：临时测试库未能删除（文件仍被占用），下次运行开始时会自动清理。');
}

process.exit(failures.length ? 1 : 0);
