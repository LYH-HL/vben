# 部署说明

本项目是前后端分离的两块：

- **前端**：`pnpm build` 产出的 `dist/`，纯静态文件（路由是 hash 模式，不需要 history 回退配置）
- **后端**：`server/index.js`，一个常驻 Node 进程，监听 `PORT`（默认 3001），数据落在 `server/data/school.db`

---

## 一、构建前端

```bash
pnpm install
pnpm build          # 产物在 dist/
```

> ⚠️ **`VITE_API_BASE` 是编译期注入的**，改了必须重新 build，运行时改 `.env` 无效。
> 在 `D:\work\vben\.env` 里写：`VITE_API_BASE=/api`（同域反代，见下文），或
> `VITE_API_BASE=https://api.example.com/api`（跨域直连）。

## 二、启动后端

```bash
cd server
pnpm install                        # 部署机必须重新安装，better-sqlite3 是原生模块，和 Node 大版本绑定
cp .env.example .env                # 填入 JWT_SECRET
node index.js
```

`server/.env`：

```ini
PORT=3001
ALLOWED_ORIGINS=https://your-domain.com      # 跨域部署时填前端域名；同域反代可留空
JWT_SECRET=<64 位十六进制>                     # 必填，缺失会拒绝启动
JWT_EXPIRES=7d
```

生成密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 三、Nginx（推荐：同域反代，最省事）

同域反代下浏览器只跟一个源打交道，**不存在跨域**，也不用配 `ALLOWED_ORIGINS`。

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /var/www/vben/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

配套：`.env` 里 `VITE_API_BASE=/api`，然后 **重新 build**。

> 若要跨域直连（前端和后端不同域），后端 `ALLOWED_ORIGINS` 必须包含前端的完整源
> （含协议和端口，例如 `https://admin.example.com`），否则浏览器会被 CORS 拦掉。

## 四、进程守护

**Linux / systemd**

```ini
# /etc/systemd/system/vben.service
[Unit]
Description=vben server
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/vben/server
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload && systemctl enable --now vben
```

**任意平台：pm2**

```bash
npm i -g pm2
cd server && pm2 start index.js --name vben-api
pm2 save && pm2 startup
```

**Windows：NSSM**（把 node 注册成服务）

```powershell
nssm install vben-api "C:\Program Files\nodejs\node.exe" "D:\work\vben\server\index.js"
nssm set vben-api AppDirectory "D:\work\vben\server"
nssm start vben-api
```

---

## 五、数据与备份

- 全部数据在 `server/data/school.db` 一个文件里，**先停服务再复制**（或 `sqlite3 school.db ".backup"` 在线备份）。
- 首次启动表为空时会自动建表并灌入初始数据；库文件存在时不会覆盖。
- 想重建演示数据：停服务 → 删掉 `school.db` → 启动。

## 六、上线前检查清单

- [ ] `server/.env` 里的 `JWT_SECRET` 是**新生成**的，不是仓库里的示例值
- [ ] 改掉 `wangmeng / admin123` 这个管理员默认密码（当前项目没有改密码界面，需直接改库或加接口）
- [ ] `ALLOWED_ORIGINS` 只放真实域名，不要留 `localhost`
- [ ] 全站 HTTPS（token 走 Authorization 头，明文传输会被截获）
- [ ] 部署机上 `pnpm install` 与运行时 Node 大版本一致，否则 `better-sqlite3` 会报 ABI 不匹配
- [ ] 日志有落盘（当前只有 `console.log`，建议接 systemd 日志或 pm2 logs）

## 七、已知限制

- **单进程**：登录限流、验证码都存进程内存，多实例部署会失效，需要换 Redis。
- **无迁移工具**：库结构变更靠 `db.js` 里的 `CREATE TABLE IF NOT EXISTS` 和一次性迁移函数，没有版本化迁移。
- **无反向代理下的静态资源缓存策略**：建议在 Nginx 给 `dist/assets/` 加长缓存（文件名带 hash，可设 1 年）。
