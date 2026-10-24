// 数据库连接 + 建表 + 初始数据
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
// 允许用 DB_FILE 指定别的数据库文件：集成测试用它跑独立库，避免污染真实数据
const dbFile = process.env.DB_FILE ? path.resolve(process.env.DB_FILE) : path.join(dataDir, 'school.db');

fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = new Database(dbFile);

// ===== 建表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    name TEXT,
    email TEXT,
    password TEXT DEFAULT '123456',
    role TEXT,
    status INTEGER DEFAULT 1,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    name TEXT,
    email TEXT,
    subject TEXT,
    title TEXT,
    status INTEGER DEFAULT 1,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    grade TEXT,
    head_teacher TEXT,
    student_count INTEGER DEFAULT 0,
    room TEXT,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    teacher TEXT,
    class_name TEXT,
    credit REAL,
    hours INTEGER,
    room TEXT,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT,
    course_id INTEGER REFERENCES courses(id),
    score REAL,
    exam_type TEXT,
    semester TEXT,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    publisher TEXT,
    type TEXT,
    status INTEGER DEFAULT 1,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    site_name TEXT,
    description TEXT,
    email TEXT,
    dark_mode INTEGER DEFAULT 0
  );
`);

// ===== 初始数据（表空才插入） =====
function seed(tableName, countSql, insertSql, data) {
  const row = db.prepare(countSql).get();
  if (row.c > 0) return;
  const insert = db.prepare(insertSql);
  for (const item of data) insert.run(item);
  console.log(`已插入 ${tableName} 初始数据：${data.length} 条`);
}

// 用户初始数据（密码写明文，插入前用 bcrypt 加密）
const usersRaw = [
  {
    username: 'wangmeng',
    name: '王萌',
    email: 'wangmeng@example.com',
    password: 'admin123',
    role: '管理员',
    status: 1,
    created_at: '2026-09-01',
  },
  {
    username: 'zhangyuxin',
    name: '张雨欣',
    email: 'zhangyuxin@example.com',
    password: '123456',
    role: '学生',
    status: 1,
    created_at: '2026-09-02',
  },
  {
    username: 'lihao',
    name: '李浩',
    email: 'lihao@example.com',
    password: '123456',
    role: '学生',
    status: 0,
    created_at: '2026-09-03',
  },
  {
    username: 'chenmengqi',
    name: '陈梦琪',
    email: 'chenmengqi@example.com',
    password: '123456',
    role: '学生',
    status: 1,
    created_at: '2026-09-04',
  },
  {
    username: 'liuyang',
    name: '刘洋',
    email: 'liuyang@example.com',
    password: '123456',
    role: '学生',
    status: 1,
    created_at: '2026-09-05',
  },
  {
    username: 'wanghaoyu',
    name: '王浩宇',
    email: 'wanghaoyu@example.com',
    password: '123456',
    role: '学生',
    status: 0,
    created_at: '2026-09-06',
  },
  {
    username: 'zhaolei',
    name: '赵磊',
    email: 'zhaolei@example.com',
    password: '123456',
    role: '学生',
    status: 1,
    created_at: '2026-09-07',
  },
  {
    username: 'sunjiayi',
    name: '孙佳怡',
    email: 'sunjiayi@example.com',
    password: '123456',
    role: '学生',
    status: 1,
    created_at: '2026-09-08',
  },
  {
    username: 'zhouxiaotong',
    name: '周晓彤',
    email: 'zhouxiaotong@example.com',
    password: '123456',
    role: '学生',
    status: 0,
    created_at: '2026-09-09',
  },
  {
    username: 'wujie',
    name: '吴杰',
    email: 'wujie@example.com',
    password: '123456',
    role: '学生',
    status: 1,
    created_at: '2026-09-10',
  },
  {
    username: 'linjia',
    name: '林佳',
    email: 'linjia@example.com',
    password: '123456',
    role: '学生',
    status: 1,
    created_at: '2026-09-11',
  },
  {
    username: 'xuwenbo',
    name: '许文博',
    email: 'xuwenbo@example.com',
    password: '123456',
    role: '学生',
    status: 1,
    created_at: '2026-09-12',
  },
];
// 插入前把每个密码用 bcrypt 加密（10 是加密强度）
const usersData = usersRaw.map((u) => ({ ...u, password: bcrypt.hashSync(u.password, 10) }));

seed(
  'users',
  'SELECT COUNT(*) AS c FROM users',
  `INSERT INTO users (username, name, email, password, role, status, created_at)
   VALUES (@username, @name, @email, @password, @role, @status, @created_at)`,
  usersData
);

seed(
  'teachers',
  'SELECT COUNT(*) AS c FROM teachers',
  `INSERT INTO teachers (username, name, email, subject, title, status, created_at)
   VALUES (@username, @name, @email, @subject, @title, @status, @created_at)`,
  [
    {
      username: 'wangli',
      name: '王莉',
      email: 'wangli@example.com',
      subject: '数学',
      title: '副教授',
      status: 1,
      created_at: '2026-09-01',
    },
    {
      username: 'liqiang',
      name: '李强',
      email: 'liqiang@example.com',
      subject: '语文',
      title: '教授',
      status: 1,
      created_at: '2026-09-01',
    },
    {
      username: 'zhangwei',
      name: '张伟',
      email: 'zhangwei@example.com',
      subject: '英语',
      title: '讲师',
      status: 1,
      created_at: '2026-09-02',
    },
    {
      username: 'chenjing',
      name: '陈静',
      email: 'chenjing@example.com',
      subject: '物理',
      title: '副教授',
      status: 0,
      created_at: '2026-09-02',
    },
    {
      username: 'yangliu',
      name: '杨柳',
      email: 'yangliu@example.com',
      subject: '化学',
      title: '教授',
      status: 1,
      created_at: '2026-09-03',
    },
    {
      username: 'zhaomin',
      name: '赵敏',
      email: 'zhaomin@example.com',
      subject: '生物',
      title: '讲师',
      status: 1,
      created_at: '2026-09-03',
    },
    {
      username: 'sunjie',
      name: '孙杰',
      email: 'sunjie@example.com',
      subject: '历史',
      title: '副教授',
      status: 1,
      created_at: '2026-09-04',
    },
    {
      username: 'zhouyun',
      name: '周云',
      email: 'zhouyun@example.com',
      subject: '地理',
      title: '讲师',
      status: 0,
      created_at: '2026-09-04',
    },
    {
      username: 'wutao',
      name: '吴涛',
      email: 'wutao@example.com',
      subject: '信息技术',
      title: '教授',
      status: 1,
      created_at: '2026-09-05',
    },
    {
      username: 'zhengfang',
      name: '郑芳',
      email: 'zhengfang@example.com',
      subject: '音乐',
      title: '讲师',
      status: 1,
      created_at: '2026-09-05',
    },
    {
      username: 'linfeng',
      name: '林峰',
      email: 'linfeng@example.com',
      subject: '体育',
      title: '副教授',
      status: 1,
      created_at: '2026-09-06',
    },
    {
      username: 'xuhong',
      name: '徐红',
      email: 'xuhong@example.com',
      subject: '美术',
      title: '讲师',
      status: 1,
      created_at: '2026-09-06',
    },
  ]
);

seed(
  'classes',
  'SELECT COUNT(*) AS c FROM classes',
  `INSERT INTO classes (name, grade, head_teacher, student_count, room, created_at)
   VALUES (@name, @grade, @head_teacher, @student_count, @room, @created_at)`,
  [
    {
      name: '高三(1)班',
      grade: '高三',
      head_teacher: '李强',
      student_count: 45,
      room: 'A301',
      created_at: '2026-09-01',
    },
    {
      name: '高三(2)班',
      grade: '高三',
      head_teacher: '王莉',
      student_count: 48,
      room: 'A302',
      created_at: '2026-09-01',
    },
    {
      name: '高三(3)班',
      grade: '高三',
      head_teacher: '陈静',
      student_count: 42,
      room: 'A303',
      created_at: '2026-09-01',
    },
    {
      name: '高三(4)班',
      grade: '高三',
      head_teacher: '杨柳',
      student_count: 46,
      room: 'A304',
      created_at: '2026-09-01',
    },
    {
      name: '高二(1)班',
      grade: '高二',
      head_teacher: '孙杰',
      student_count: 50,
      room: 'B201',
      created_at: '2026-09-02',
    },
    {
      name: '高二(2)班',
      grade: '高二',
      head_teacher: '周云',
      student_count: 47,
      room: 'B202',
      created_at: '2026-09-02',
    },
    {
      name: '高二(3)班',
      grade: '高二',
      head_teacher: '吴涛',
      student_count: 49,
      room: 'B203',
      created_at: '2026-09-02',
    },
    {
      name: '高二(4)班',
      grade: '高二',
      head_teacher: '郑芳',
      student_count: 44,
      room: 'B204',
      created_at: '2026-09-02',
    },
    {
      name: '高一(1)班',
      grade: '高一',
      head_teacher: '张伟',
      student_count: 52,
      room: 'C101',
      created_at: '2026-09-03',
    },
    {
      name: '高一(2)班',
      grade: '高一',
      head_teacher: '赵敏',
      student_count: 51,
      room: 'C102',
      created_at: '2026-09-03',
    },
    {
      name: '高一(3)班',
      grade: '高一',
      head_teacher: '林峰',
      student_count: 48,
      room: 'C103',
      created_at: '2026-09-03',
    },
    {
      name: '高一(4)班',
      grade: '高一',
      head_teacher: '徐红',
      student_count: 46,
      room: 'C104',
      created_at: '2026-09-03',
    },
  ]
);

seed(
  'courses',
  'SELECT COUNT(*) AS c FROM courses',
  `INSERT INTO courses (name, teacher, class_name, credit, hours, room, created_at)
   VALUES (@name, @teacher, @class_name, @credit, @hours, @room, @created_at)`,
  [
    {
      name: '高等数学',
      teacher: '王莉',
      class_name: '高三(1)班',
      credit: 4,
      hours: 64,
      room: 'A301',
      created_at: '2026-09-01',
    },
    {
      name: '大学语文',
      teacher: '李强',
      class_name: '高三(2)班',
      credit: 3,
      hours: 48,
      room: 'A302',
      created_at: '2026-09-01',
    },
    {
      name: '英语口语',
      teacher: '张伟',
      class_name: '高三(3)班',
      credit: 2,
      hours: 32,
      room: '语言室1',
      created_at: '2026-09-02',
    },
    {
      name: '物理实验',
      teacher: '陈静',
      class_name: '高三(4)班',
      credit: 2,
      hours: 36,
      room: '物理实验室',
      created_at: '2026-09-02',
    },
    {
      name: '有机化学',
      teacher: '杨柳',
      class_name: '高二(1)班',
      credit: 3,
      hours: 48,
      room: '化学实验室',
      created_at: '2026-09-03',
    },
    {
      name: '生物导论',
      teacher: '赵敏',
      class_name: '高二(2)班',
      credit: 2,
      hours: 32,
      room: '生物实验室',
      created_at: '2026-09-03',
    },
    {
      name: '中国近代史',
      teacher: '孙杰',
      class_name: '高二(3)班',
      credit: 2,
      hours: 36,
      room: 'B203',
      created_at: '2026-09-04',
    },
    {
      name: '地理信息系统',
      teacher: '周云',
      class_name: '高二(4)班',
      credit: 2,
      hours: 32,
      room: 'B204',
      created_at: '2026-09-04',
    },
    {
      name: 'Python程序设计',
      teacher: '吴涛',
      class_name: '高一(1)班',
      credit: 4,
      hours: 64,
      room: '机房1',
      created_at: '2026-09-05',
    },
    {
      name: '基础音乐',
      teacher: '郑芳',
      class_name: '高一(2)班',
      credit: 1,
      hours: 18,
      room: '音乐教室',
      created_at: '2026-09-05',
    },
    {
      name: '篮球训练',
      teacher: '林峰',
      class_name: '高一(3)班',
      credit: 1,
      hours: 36,
      room: '体育馆',
      created_at: '2026-09-06',
    },
    {
      name: '素描基础',
      teacher: '徐红',
      class_name: '高一(4)班',
      credit: 2,
      hours: 36,
      room: '美术室',
      created_at: '2026-09-06',
    },
  ]
);

// ===== 成绩表迁移：从「科目文本」改挂 courses 表外键 =====
// 旧库里 scores.course 存的是科目名（数学/语文/…），与 courses 表的课程名对不上；
// 这里把已知科目按对应关系映射到真实课程，其余按同名匹配，仍匹配不到的行跳过并告警。
const SUBJECT_TO_COURSE = {
  数学: '高等数学',
  语文: '大学语文',
  英语: '英语口语',
  物理: '物理实验',
  化学: '有机化学',
  生物: '生物导论',
};

function migrateLegacyScores() {
  const columns = db
    .prepare('PRAGMA table_info(scores)')
    .all()
    .map((c) => c.name);
  // 新库直接就是 course_id；已经是新结构就什么都不做
  if (columns.includes('course_id') || !columns.includes('course')) return;

  const findCourse = db.prepare('SELECT id FROM courses WHERE name = ?');
  const legacyRows = db.prepare('SELECT * FROM scores').all();

  db.exec('DROP TABLE IF EXISTS scores_migrated');
  db.exec(`
    CREATE TABLE scores_migrated (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT,
      course_id INTEGER REFERENCES courses(id),
      score REAL,
      exam_type TEXT,
      semester TEXT,
      created_at TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT INTO scores_migrated (student_name, course_id, score, exam_type, semester, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  let skipped = 0;
  for (const row of legacyRows) {
    const target = SUBJECT_TO_COURSE[row.course] || row.course;
    const course = findCourse.get(target) || findCourse.get(row.course);
    if (!course) {
      skipped += 1;
      continue;
    }
    insert.run(row.student_name, course.id, row.score, row.exam_type, row.semester, row.created_at);
  }

  db.exec('DROP TABLE scores');
  db.exec('ALTER TABLE scores_migrated RENAME TO scores');
  console.log(`成绩表已迁移为外键结构：保留 ${legacyRows.length - skipped} 条，跳过 ${skipped} 条`);
}

migrateLegacyScores();

// 成绩：12 名学生 × 6 门课 = 72 条
// 课程取自 courses 表（高等数学、大学语文…），不再使用与课程表脱节的科目名
const scoreCount = db.prepare('SELECT COUNT(*) AS c FROM scores').get();
if (scoreCount.c === 0) {
  const insert = db.prepare(`
    INSERT INTO scores (student_name, course_id, score, exam_type, semester, created_at)
    VALUES (@student_name, @course_id, @score, @exam_type, @semester, @created_at)
  `);
  const studentNames = [
    '王萌',
    '张雨欣',
    '李浩',
    '陈梦琪',
    '刘洋',
    '王浩宇',
    '赵磊',
    '孙佳怡',
    '周晓彤',
    '吴杰',
    '林佳',
    '许文博',
  ];
  const courseKeys = ['高等数学', '大学语文', '英语口语', '物理实验', '有机化学', '生物导论'];
  const findCourse = db.prepare('SELECT id FROM courses WHERE name = ?');
  const courseIds = courseKeys.map((name) => ({ name, id: findCourse.get(name).id }));

  studentNames.forEach((sn, si) => {
    courseIds.forEach((course, ci) => {
      const s = 60 + ((si * 11 + ci * 17) % 40);
      insert.run({
        student_name: sn,
        course_id: course.id,
        score: s,
        exam_type: (si + ci) % 2 === 0 ? '期末' : '期中',
        semester: '2026秋',
        created_at: '2026-10-01',
      });
    });
  });
  console.log(`已插入成绩初始数据：${studentNames.length * courseIds.length} 条`);
}

seed(
  'notices',
  'SELECT COUNT(*) AS c FROM notices',
  `INSERT INTO notices (title, content, publisher, type, status, created_at)
   VALUES (@title, @content, @publisher, @type, @status, @created_at)`,
  [
    {
      title: '2026年秋季学期开学典礼通知',
      content: '定于9月1日举行开学典礼。',
      publisher: '王校长',
      type: '通知',
      status: 1,
      created_at: '2026-08-28',
    },
    {
      title: '中秋节放假安排',
      content: '9月15日至17日放假，共3天。',
      publisher: '办公室',
      type: '通知',
      status: 1,
      created_at: '2026-09-10',
    },
    {
      title: '关于开展秋季运动会的公告',
      content: '运动会定于10月20日举行。',
      publisher: '体育组',
      type: '公告',
      status: 1,
      created_at: '2026-09-15',
    },
    {
      title: '期中考试安排',
      content: '期中考试时间为11月5日-8日。',
      publisher: '教务处',
      type: '通知',
      status: 1,
      created_at: '2026-09-20',
    },
    {
      title: '图书馆新书上架',
      content: '本月新增图书500册。',
      publisher: '图书馆',
      type: '新闻',
      status: 1,
      created_at: '2026-09-22',
    },
    {
      title: '国庆放假通知',
      content: '10月1日至7日放假调休。',
      publisher: '办公室',
      type: '通知',
      status: 1,
      created_at: '2026-09-25',
    },
    {
      title: '关于校园网络升级的公告',
      content: '本周末网络升级。',
      publisher: '信息中心',
      type: '公告',
      status: 1,
      created_at: '2026-09-26',
    },
    {
      title: '学生会招新启事',
      content: '学生会各部门开始招新。',
      publisher: '团委',
      type: '新闻',
      status: 1,
      created_at: '2026-09-28',
    },
    {
      title: '冬季作息时间调整',
      content: '10月15日起执行冬季作息时间。',
      publisher: '办公室',
      type: '通知',
      status: 0,
      created_at: '2026-10-01',
    },
    {
      title: '食堂菜品更新公告',
      content: '学生食堂新增窗口。',
      publisher: '后勤处',
      type: '公告',
      status: 1,
      created_at: '2026-10-03',
    },
    {
      title: '关于流感防控的通知',
      content: '近期流感高发。',
      publisher: '医务室',
      type: '通知',
      status: 1,
      created_at: '2026-10-05',
    },
    {
      title: '校园歌手大赛报名',
      content: '第十五届校园歌手大赛开始报名。',
      publisher: '团委',
      type: '新闻',
      status: 0,
      created_at: '2026-10-08',
    },
  ]
);

module.exports = db;
