```
# 智慧校园管理系统

基于 Vue3 + Express + SQLite 的全栈前后端分离管理系统，实现学生、教师、班级、课程、成绩、通知等模块的完整 CRUD。

## 技术栈

### 前端
- **Vue 3**：Composition API + `<script setup>` 语法
- **Vite 5**：构建工具
- **Element Plus**：UI 组件库
- **Pinia**：状态管理（登录状态）
- **Vue Router 4**：路由 + 登录守卫
- **Axios**：HTTP 请求

### 后端
- **Node.js + Express**：RESTful API
- **SQLite（better-sqlite3）**：轻量级数据库
- **CORS**：跨域处理

## 功能模块

| 模块 | 功能 |
|------|------|
| 工作台 | 统计卡片（学生/教师/班级/课程/通知数），点击跳转 |
| 学生管理 | 列表、分页、搜索、新增、编辑、删除 |
| 教师管理 | 列表、分页、搜索、新增、编辑、删除 |
| 班级管理 | 列表、分页、搜索、新增、编辑、删除 |
| 课程管理 | 列表、分页、搜索、新增、编辑、删除 |
| 成绩管理 | 72 条成绩（12 学生 × 6 门课），按学生筛选 |
| 通知公告 | 列表、分页、搜索、发布、编辑、删除 |
| 登录 | 路由守卫拦截，未登录自动跳转 |

## 项目结构

```

vben/
├── src/                    # 前端
│   ├── api/                # 接口封装
│   ├── layouts/           # 布局组件
│   ├── router/             # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── views/              # 页面
│   │   ├── dashboard/      # 工作台
│   │   ├── user/           # 学生管理
│   │   ├── teacher/        # 教师管理
│   │   ├── class/          # 班级管理
│   │   ├── course/        # 课程管理
│   │   ├── score/         # 成绩管理
│   │   ├── notice/        # 通知公告
│   │   └── settings/      # 系统设置
│   ├── App.vue
│   └── main.js
├── server/                 # 后端
│   ├── db.js               # 数据库连接 + 建表 + 初始数据
│   ├── routes/            # 路由模块化
│   │   ├── users.js
│   │   ├── teachers.js
│   │   ├── classes.js
│   │   ├── courses.js
│   │   ├── scores.js
│   │   ├── notices.js
│   │   └── stats.js
│   ├── index.js           # 入口（启动 + 挂载路由）
│   └── data/               # SQLite 数据库文件
├── index.html
├── package.json
└── vite.config.js

```

## 快速启动

### 环境要求
- Node.js >= 16
- pnpm

### 1. 安装依赖

```bash
# 前端依赖
pnpm install

# 后端依赖
cd server
pnpm install
cd ..
```

### 2. 启动后端（端口 3001）

```
cd server
node index.js
```

### 3. 启动前端（端口 5173）

```
pnpm dev
```

### 4. 访问

打开浏览器：[http://localhost:5173](http://localhost:5173)

## API 接口

表格

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /api/users | 学生列表（分页 + 搜索） |
| POST | /api/users | 新增学生 |
| PUT | /api/users/:id | 编辑学生 |
| DELETE | /api/users/:id | 删除学生 |
| GET | /api/teachers | 教师列表 |
| POST | /api/teachers | 新增教师 |
| PUT | /api/teachers/:id | 编辑教师 |
| DELETE | /api/teachers/:id | 删除教师 |
| GET | /api/classes | 班级列表 |
| POST | /api/classes | 新增班级 |
| PUT | /api/classes/:id | 编辑班级 |
| DELETE | /api/classes/:id | 删除班级 |
| GET | /api/courses | 课程列表 |
| POST | /api/courses | 新增课程 |
| PUT | /api/courses/:id | 编辑课程 |
| DELETE | /api/courses/:id | 删除课程 |
| GET | /api/scores | 成绩列表（支持 student 参数筛选） |
| GET | /api/notices | 通知列表 |
| POST | /api/notices | 新增通知 |
| PUT | /api/notices/:id | 编辑通知 |
| DELETE | /api/notices/:id | 删除通知 |
| GET | /api/stats | 工作台统计数据 |

## 技术亮点

- **前后端分离**：前端 Vue3 + 后端 Express，独立部署
- **数据库设计**：6 张表，初始数据自动初始化
- **路由模块化**：Express Router 拆分，代码结构清晰
- **登录守卫**：Vue Router beforeEach 拦截未登录访问
- **状态管理**：Pinia 持久化登录状态到 localStorage
- **分页 + 搜索**：每个列表模块都实现
- **CRUD 完整**：5 个模块的增删改查

## License

