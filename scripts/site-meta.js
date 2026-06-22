'use strict';

/**
 * 站点元数据生成器
 * 输出最新的文章日期，供 Miku 守护精灵计算博客活跃度
 */
hexo.extend.generator.register('site-meta', function () {
  const posts = this.locals.get('posts');
  let newestDate = null;

  posts.forEach((post) => {
    if (post.date && (!newestDate || post.date > newestDate)) {
      newestDate = post.date;
    }
  });

  const now = new Date();
  const diffDays = newestDate
    ? Math.floor((now - new Date(newestDate)) / (1000 * 60 * 60 * 24))
    : 999;

  return {
    path: 'site-meta.json',
    data: JSON.stringify({
      newestPostDate: newestDate ? newestDate.format('YYYY-MM-DD') : null,
      daysSinceLastUpdate: diffDays,
      generatedAt: now.toISOString(),
    }),
  };
});
