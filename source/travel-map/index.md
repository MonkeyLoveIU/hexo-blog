---
title: 旅行轨迹
date: 2025-01-01
type: travel-map
comments: false
---
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<div id="travel-map" style="width:100%;height:600px;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);"></div>
<script>
fetch('/travel-map-data.json')
  .then(r => r.json())
  .then(points => {
    const map = L.map('travel-map').setView([32, 114], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    if (points.length === 0) {
      document.getElementById('travel-map').innerHTML = '<div style="text-align:center;padding:100px 20px;color:#999;">暂无旅行记录</div>';
      return;
    }

    const bounds = [];
    points.forEach(p => {
      const marker = L.marker([p.lat, p.lng]).addTo(map);
      const dateStr = p.date ? `<br><span style="font-size:12px;opacity:0.7">${p.date}</span>` : '';
      const locStr = p.location ? `<br><span style="font-size:12px;opacity:0.6">📍 ${p.location}</span>` : '';
      marker.bindPopup(`
        <div style="min-width:160px;text-align:center;">
          ${p.cover ? `<img src="${p.cover}" style="width:100%;border-radius:6px;margin-bottom:8px;max-height:120px;object-fit:cover;">` : ''}
          <div style="font-weight:700;font-size:15px;">${p.title}</div>
          ${locStr}${dateStr}
          <br><a href="${p.url}" style="display:inline-block;margin-top:8px;padding:4px 12px;background:#ff5252;color:#fff;border-radius:6px;text-decoration:none;font-size:13px;">阅读游记 →</a>
        </div>
      `);
      bounds.push([p.lat, p.lng]);
    });

    if (bounds.length > 1) {
      // 绘制连线
      L.polyline(bounds, { color: '#ff5252', weight: 2, opacity: 0.5, dashArray: '6,8' }).addTo(map);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  });
</script>
<div style="margin-top:16px;text-align:center;font-size:13px;opacity:0.6;">
  记录主人走过的山川与远方
</div>
