'use strict';

/**
 * 生成旅行地图数据 JSON
 * 读取所有含有 latitude/longitude 的文章，输出为 JSON 文件
 */
hexo.extend.generator.register('travel-map-data', (locals) => {
  const points = [];

  (locals.posts || []).each((post) => {
    if (post.latitude && post.longitude) {
      points.push({
        title: post.title,
        url: post.permalink,
        date: post.date ? post.date.format('YYYY-MM-DD') : '',
        lat: parseFloat(post.latitude),
        lng: parseFloat(post.longitude),
        location: post.location || '',
        cover: post.cover || '',
      });
    }
  });

  return {
    path: 'travel-map-data.json',
    data: JSON.stringify(points),
  };
});
