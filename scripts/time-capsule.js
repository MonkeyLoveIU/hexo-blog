'use strict';

/**
 * 留言时空胶囊数据生成器
 * 收集所有含有 time_capsule_date front-matter 的文章
 */
hexo.extend.generator.register('time-capsule-data', function () {
  const posts = this.locals.get('posts');
  const capsules = [];

  posts.forEach((post) => {
    if (post.time_capsule_date && post.time_capsule_message) {
      capsules.push({
        title: post.title,
        url: post.permalink,
        date: post.time_capsule_date,
        message: post.time_capsule_message,
        slug: post.slug,
      });
    }
  });

  return {
    path: 'time-capsule-data.json',
    data: JSON.stringify(capsules),
  };
});
