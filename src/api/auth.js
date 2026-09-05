import axios from 'axios';

// axios 实例（以后接真实后端用它）
export const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 登录接口（模拟）：演示账号 admin / 123456
export function loginApi(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.username === 'admin' && data.password === '123456') {
        resolve({ token: 'fake-token-' + Date.now(), username: data.username });
      } else {
        reject(new Error('账号或密码错误'));
      }
    }, 500);
  });
}

// 生成图形验证码（Canvas 动态绘制，演示用）
export function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let text = '';
  for (let i = 0; i < 4; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }

  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 44;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f0f2f5';
  ctx.fillRect(0, 0, 120, 44);

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 120, Math.random() * 44);
    ctx.lineTo(Math.random() * 120, Math.random() * 44);
    ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`;
    ctx.stroke();
  }

  for (let i = 0; i < text.length; i++) {
    ctx.save();
    ctx.translate(15 + i * 26, 28);
    ctx.rotate((Math.random() - 0.5) * 0.6);
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = `hsl(${Math.random() * 360},70%,40%)`;
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  return { dataUrl: canvas.toDataURL('image/png'), text };
}
