// 极简内存限流：按来源 IP 计数，用于登录等敏感接口的暴力破解防护
// 说明：单进程内存实现，进程重启即清零；多实例部署需换成 Redis 等共享存储
function createLimiter({ max, windowMs, message }) {
  const buckets = new Map();

  // 定期清理过期桶，防止 Map 无限增长（unref 避免拖住进程退出）
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, item] of buckets) {
      if (now > item.resetAt) buckets.delete(key);
    }
  }, windowMs);
  if (typeof timer.unref === 'function') timer.unref();

  return function limiter(req, res, next) {
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
    const now = Date.now();
    const item = buckets.get(ip);

    if (!item || now > item.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    item.count += 1;
    if (item.count > max) {
      const retryAfter = Math.max(1, Math.ceil((item.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        code: 1,
        message: message || `尝试过于频繁，请 ${retryAfter} 秒后再试`,
      });
    }

    next();
  };
}

module.exports = { createLimiter };
