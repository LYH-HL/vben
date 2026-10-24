# 智慧校园管理系统

[![CI](https://github.com/LYH-HL/vben/actions/workflows/ci.yml/badge.svg)](https://github.com/LYH-HL/vben/actions/workflows/ci.yml)

基于 Vue 3 + Express + SQLite 的前后端分离管理系统，覆盖学生、教师、班级、课程、成绩、通知六个业务模块。
登录采用 **图形验证码 + bcrypt 密码校验 + JWT 鉴权**，并按角色控制写权限。

## 技术栈

| 层     | 技术                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| 前端   | Vue 3（`<script setup>`）、Vite 5、Element Plus、Pinia、Vue Router 4（hash 模式）、Axios |
| 后端   | Node.js、Express 5、better-sqlite3、jsonwebtoken、bcryptjs、svg-captcha、dotenv、cors    |
| 数据库 | SQLite（`server/data/school.db`，首次启动自动建表并灌入初始数据）                        |

## 功能模块

| 模块     | 功能                                                                | 权限                 |
| -------- | ------------------------------------------------------------------- | -------------------- |
| 工作台   | 学生/教师/班级/课程/通知数量统计，卡片点击跳转                      | 登录                 |
| 学生管理 | 列表、分页、搜索、新增、编辑、删除                                  | 读：登录；写：管理员 |
| 教师管理 | 列表、分页、搜索、新增、编辑、删除                                  | 读：登录；写：管理员 |
| 班级管理 | 列表、分页、搜索、新增、编辑、删除                                  | 读：登录；写：管理员 |
| 课程管理 | 列表、分页、搜索、新增、编辑、删除                                  | 读：登录；写：管理员 |
| 成绩管理 | 72 条成绩（12 学生 × 6 门课），按学生筛选、分数评级、录入/编辑/删除 | 读：登录；写：管理员 |
| 通知公告 | 列表、分页、搜索、发布、编辑、删除                                  | 读：登录；写：管理员 |
| 登录     | 图形验证码、登录限流、JWT 鉴权、停用账号拦截                        | 公开                 |
| 404      | 未匹配路由统一落到 404 页面                                         | 登录                 |

## 项目结构

```
vben/
├── src/                       # 前端
│   ├── api/                   # 接口封装（auth / user / teacher / class / course / score / notice / dashboard）
│   ├── layouts/               # admin-layout（侧栏+顶栏）、auth-layout（登录分栏）
│   ├── router/                # 路由表 + 登录守卫 + 404 兜底
│   ├── stores/                # Pinia：token / username / realname / role
│   ├── views/                 # dashboard、user、teacher、class、course、score、notice、settings、login、not-found
│   ├── App.vue
│   └── main.js
├── server/                    # 后端
│   ├── index.js               # 入口：配置、CORS、路由挂载、统一错误处理
│   ├── db.js                  # 建表 + 初始数据
│   ├── middleware/auth.js     # 认证 + 授权（读=登录，写=管理员）
│   ├── routes/                # auth / captcha / users / teachers / classes / courses / scores / notices / stats
│   ├── utils/                 # jwt、captcha、ratelimit
│   ├── data/school.db         # SQLite 数据库文件
│   └── .env.example           # 环境变量模板
├── index.html
├── vite.config.js
├── package.json
└── .env.example               # 前端环境变量模板
```

## 快速启动

### 环境要求

- Node.js ≥ 18
- pnpm 或 npm

### 1. 安装依赖

```bash
# 前端
pnpm install

# 后端
cd server && pnpm install && cd ..
```

### 2. 配置环境变量

```bash
# 前端（可选，不配则默认 http://localhost:3001/api）
cp .env.example .env

# 后端（必填，缺 JWT_SECRET 会拒绝启动）
cd server
cp .env.example .env
# 生成密钥并填入 JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. 一键启动（推荐）

```bash
pnpm dev        # 同时拉起后端 3001 与前端 5173，Ctrl+C 一起退出
```

### 4. 或者分开启动

```bash
pnpm dev:server # 只启后端（node --watch，改后端代码自动重启）
pnpm dev:web    # 只启前端
```

### 5. 访问

浏览器打开 <http://localhost:5173>

**默认账号**

| 账号                                 | 密码       | 角色   | 状态             |
| ------------------------------------ | ---------- | ------ | ---------------- |
| `wangmeng`                           | `admin123` | 管理员 | 启用（可增删改） |
| `zhangyuxin` 等其余账号              | `123456`   | 学生   | 启用（只读）     |
| `lihao`、`wanghaoyu`、`zhouxiaotong` | `123456`   | 学生   | 停用（登录被拒） |

> 新增学生的初始密码固定为 `123456`，入库前用 bcrypt 加密。

## 环境变量

**server/.env**

| 变量              | 默认                                          | 说明                             |
| ----------------- | --------------------------------------------- | -------------------------------- |
| `PORT`            | `3001`                                        | 后端监听端口                     |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | 允许跨域的前端来源，逗号分隔     |
| `JWT_SECRET`      | 无（必填）                                    | JWT 签名密钥，缺失时后端拒绝启动 |
| `JWT_EXPIRES`     | `7d`                                          | token 有效期                     |

**根目录 .env**

| 变量            | 默认                        | 说明                   |
| --------------- | --------------------------- | ---------------------- |
| `VITE_API_BASE` | `http://localhost:3001/api` | 前端访问的后端接口地址 |

## API 接口

| 方法            | 路径                  | 鉴权   | 说明                                                        |
| --------------- | --------------------- | ------ | ----------------------------------------------------------- |
| GET             | `/api/hello`          | 公开   | 健康检查                                                    |
| GET             | `/api/captcha`        | 公开   | 获取验证码（`captchaId` + SVG），5 分钟有效、一次性         |
| POST            | `/api/login`          | 公开   | 登录，返回 `accessToken` / `username` / `realname` / `role` |
| GET             | `/api/users`          | 登录   | 学生列表（`_page` / `_limit` / `q`）                        |
| POST            | `/api/users`          | 管理员 | 新增学生                                                    |
| PUT             | `/api/users/:id`      | 管理员 | 编辑学生（不修改密码）                                      |
| DELETE          | `/api/users/:id`      | 管理员 | 删除学生                                                    |
| GET             | `/api/teachers`       | 登录   | 教师列表                                                    |
| POST/PUT/DELETE | `/api/teachers[/:id]` | 管理员 | 教师增删改                                                  |
| GET             | `/api/classes`        | 登录   | 班级列表                                                    |
| POST/PUT/DELETE | `/api/classes[/:id]`  | 管理员 | 班级增删改                                                  |
| GET             | `/api/courses`        | 登录   | 课程列表                                                    |
| POST/PUT/DELETE | `/api/courses[/:id]`  | 管理员 | 课程增删改                                                  |
| GET             | `/api/scores`         | 登录   | 成绩列表（支持 `student` 按学生筛选、`q` 搜学生或课程名）   |
| POST            | `/api/scores`         | 管理员 | 录入成绩（`courseId` 必须是课程表中已存在的课程）           |
| PUT             | `/api/scores/:id`     | 管理员 | 修改成绩                                                    |
| DELETE          | `/api/scores/:id`     | 管理员 | 删除成绩                                                    |
| GET             | `/api/notices`        | 登录   | 通知列表                                                    |
| POST/PUT/DELETE | `/api/notices[/:id]`  | 管理员 | 通知增删改                                                  |
| GET             | `/api/stats`          | 登录   | 工作台统计数据                                              |

列表接口统一返回数组，并通过响应头 `x-total-count` 给出总数。
未匹配的 `/api/*` 返回 JSON 404，不会吐出 HTML 错误页。

## 安全设计

- **密码**：bcrypt（10 轮）加密存储，登录只做密文比对，任何接口都不返回密码字段。
- **验证码**：后端 `svg-captcha` 生成，内存存储 5 分钟、校验一次即作废，另有定时清理。
- **登录限流**：同一 IP 5 分钟内超过 10 次尝试返回 `429`，并带 `Retry-After`。
- **鉴权**：JWT 携带 `id/username/role`；停用账号（`status=0`）即便密码正确也拒绝登录。
- **授权**：写操作（POST/PUT/DELETE）要求 `role=管理员`，否则 `403`；前端同步隐藏按钮。
- **跨域**：只放开 `ALLOWED_ORIGINS` 白名单内的来源。

## 数据模型

成绩不再把课程名当作文本存，而是通过外键关联课程表：

```
scores.course_id  ──►  courses.id
```

- 成绩列表由后端 `JOIN courses` 返回课程名，前端只认 `courseId`；
  录入时课程是下拉选择，不会出现「数学 / 高等数学」这种同一门课两种写法。
- 旧库会在启动时自动迁移：把历史上的科目名按 `数学→高等数学、语文→大学语文、英语→英语口语、物理→物理实验、化学→有机化学、生物→生物导论` 映射成 `course_id`，
  迁移在 `server/db.js` 的 `migrateLegacyScores()` 里，只跑一次，匹配不到的行会跳过并打印数量。

> 尚未规范化：`classes.head_teacher`、`courses.teacher`、`courses.class_name` 仍是文本（按名字关联），要改成外键需要同步调整多个页面与历史数据。

## 构建

```bash
pnpm build      # 产物在 dist/
pnpm preview    # 本地预览构建产物
```

Element Plus 采用**按需引入**：组件与样式都走 `element-plus/es/components/<name>/...` 子路径，
`main.js` 只注册实际用到的 27 个组件 + `v-loading` 指令；`ElMessage` / `ElMessageBox`
由 `unplugin-auto-import` 从子路径自动导入（见 `vite.config.js`），业务代码里不用手写 import。

| 项                | 全量引入 | 现在       |
| ----------------- | -------- | ---------- |
| JS                | ~1268 KB | **605 KB** |
| 其中 Element Plus | ~1090 KB | **400 KB** |
| CSS               | 362 KB   | **139 KB** |
| 合计              | ~1630 KB | **744 KB** |

⚠️ 两条必须遵守的约定：

1. **不要写 `import { ElMessage } from 'element-plus'`**——桶导入会把整个组件库重新拖进包里。
2. **不要用 `ElementPlusResolver`** 做组件按需（`unplugin-vue-components`）。这个版本（2.14.7）的
   resolver 生成的是 `from 'element-plus/es'` 桶导入，实测反而从 393 KB 涨到 **950 KB**，
   按需引入完全失效。新组件请按 `main.js` 里的子路径方式引入，并补上对应的 `style/css.mjs`。

## 常用命令

| 命令                                | 作用                                              |
| ----------------------------------- | ------------------------------------------------- |
| `pnpm dev`                          | 一键启动前后端（3001 + 5173）                     |
| `pnpm dev:web` / `pnpm dev:server`  | 只启其中一端                                      |
| `pnpm build`                        | 生产构建到 `dist/`                                |
| `pnpm preview`                      | 本地预览构建产物                                  |
| `pnpm test:api`                     | 接口集成测试（33 项，用独立临时库，不碰真实数据） |
| `pnpm lint` / `pnpm lint:fix`       | ESLint 检查 / 自动修                              |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 校验                            |

> `test:api` 会把 `DB_FILE` 指向 `.tmp-api-test/test.db`，跑完自动清理；
> 它只把「验证码校验」替换成固定口令 `test`，其余走的是和生产完全一样的代码路径。

## 持续集成

[.github/workflows/ci.yml](.github/workflows/ci.yml) 在每次 push 到 `main` 和每个 PR 上依次执行：

```
pnpm install → server 安装依赖 → pnpm lint → pnpm format:check → pnpm test:api → pnpm build
```

后端 `.env` 由 CI 现场生成（随机 `JWT_SECRET`），仓库里不放任何密钥。
其他步骤全部失败即红，所以「规范、格式、接口、构建」四项有一条坏掉都会立刻暴露。

> 推送到 GitHub 之后想看徽章，在 README 顶部加一行：
> `![CI](https://github.com/<你的账号>/<仓库名>/actions/workflows/ci.yml/badge.svg)`

## 部署

见 [docs/deploy.md](docs/deploy.md)：Nginx 同域反代配置、systemd/pm2/NSSM 守护、
`VITE_API_BASE` 的编译期注意事项、上线前检查清单。

## License

MIT
