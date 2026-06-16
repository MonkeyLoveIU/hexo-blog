---
title: 我的 HTML 展览馆
date: 2026-05-24 10:00:00
---

<style>
/* 给你手搓的画廊加点基本的现代文明（CSS Grid） */
.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
}
.gallery-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease;
    text-align: center;
}
.gallery-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
.gallery-item img {
    width: 100%;
    height: 150px;
    object-fit: cover;
}
.gallery-item h3 {
    margin: 10px 0;
    font-size: 18px;
}
.gallery-item a {
    display: block;
    text-decoration: none;
    color: inherit;
}
</style>

<div class="gallery-grid">
    <div class="gallery-item">
        <a href="/gallery-items/xixi.html" target="_blank">
            <img src="https://img.monkeyiu.icu/{year}/{month}/{md5}.{extName}/six.webp" alt="NS">
            <h3>NS方程</h3>
        </a>
    </div>

<div class="gallery-grid">
    <div class="gallery-item">
        <a href="/gallery-items/movie.html" target="_blank">
            <img src="https://img.monkeyiu.icu/{year}/{month}/{md5}.{extName}/five.webp" alt="Movie">
            <h3>影库</h3>
        </a>
    </div>


</div>