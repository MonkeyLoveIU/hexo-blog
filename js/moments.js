import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';

document.addEventListener('DOMContentLoaded', () => {
  // 遍历所有 .moments-comments 容器
  document.querySelectorAll('.moments-comments').forEach(el => {
    const id = el.getAttribute('id'); // waline-moment-2024-01-15-14-30
    if (!id) return;

    // 用 id 当作 path，保证每条说说独立
    init({
      el: `#${id}`,
      serverURL: 'https://waline-text-omnf4msbv-key-mons-projects.vercel.app',
      path: `/moments/${id}`, 
      comment: true,
      reaction: true
    });
  });
});













// document.addEventListener('DOMContentLoaded', function() {
//   // 为每个说说的点赞按钮添加功能
//   document.querySelectorAll('.moments-likes').forEach((likeBtn, index) => {
//     const momentItem = likeBtn.closest('.moments-item');
//     const momentId = momentItem.dataset.momentId || `moment-${index}`;
    
//     // 为说说项添加唯一ID
//     if (!momentItem.dataset.momentId) {
//       momentItem.dataset.momentId = momentId;
//     }
    
//     // 检查用户是否已点赞
//     const likedMoments = JSON.parse(localStorage.getItem('likedMoments') || '[]');
//     if (likedMoments.includes(momentId)) {
//       likeBtn.classList.add('liked');
//     }
    
//     // 添加点击事件
//     likeBtn.addEventListener('click', function() {
//       handleLike(momentId, this);
//     });
//   });
  
//   // 点赞处理函数
//   function handleLike(momentId, likeBtn) {
//     const likedMoments = JSON.parse(localStorage.getItem('likedMoments') || '[]');
//     const countSpan = likeBtn.querySelector('.likes-count');
//     let currentCount = parseInt(countSpan.textContent);
    
//     if (likedMoments.includes(momentId)) {
//       // 取消点赞
//       likedMoments.splice(likedMoments.indexOf(momentId), 1);
//       localStorage.setItem('likedMoments', JSON.stringify(likedMoments));
      
//       likeBtn.classList.remove('liked');
//       countSpan.textContent = currentCount - 1;
      
//       // 显示取消点赞提示
//       showToast('已取消点赞');
//     } else {
//       // 添加点赞
//       likedMoments.push(momentId);
//       localStorage.setItem('likedMoments', JSON.stringify(likedMoments));
      
//       likeBtn.classList.add('liked');
//       countSpan.textContent = currentCount + 1;
      
//       // 显示点赞成功提示
//       showToast('点赞成功！');
      
//       // 这里可以添加同步到服务器的代码
//       // syncLikeToServer(momentId, true);
//     }
//   }
  
//   // 简单的提示功能
//   function showToast(message) {
//     // 移除已存在的提示
//     const existingToast = document.querySelector('.toast-notification');
//     if (existingToast) {
//       existingToast.remove();
//     }
    
//     // 创建新提示
//     const toast = document.createElement('div');
//     toast.className = 'toast-notification';
//     toast.textContent = message;
//     toast.style.cssText = `
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       background: var(--card-bg);
//       color: var(--text-color);
//       padding: 12px 20px;
//       border-radius: 8px;
//       box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//       z-index: 1000;
//       opacity: 0;
//       transform: translateY(-20px);
//       transition: all 0.3s ease;
//     `;
    
//     document.body.appendChild(toast);
    
//     // 显示动画
//     setTimeout(() => {
//       toast.style.opacity = '1';
//       toast.style.transform = 'translateY(0)';
//     }, 10);
    
//     // 3秒后自动消失
//     setTimeout(() => {
//       toast.style.opacity = '0';
//       toast.style.transform = 'translateY(-20px)';
//       setTimeout(() => toast.remove(), 300);
//     }, 3000);
//   }
  
//   // 服务器同步函数（预留接口）
//   function syncLikeToServer(momentId, isLike) {
//     // 这里可以添加AJAX请求来同步点赞状态到服务器
//     // 例如：
//     /*
//     fetch('/api/moments/like', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         momentId: momentId,
//         action: isLike ? 'like' : 'unlike'
//       })
//     })
//     .then(response => response.json())
//     .then(data => {
//       console.log('点赞同步成功:', data);
//     })
//     .catch(error => {
//       console.error('点赞同步失败:', error);
//     });
//     */
//   }
// });

// // document.addEventListener('DOMContentLoaded', function() {
// //   // 点赞功能
// //   document.querySelectorAll('.moments-likes').forEach(likeBtn => {
// //     likeBtn.addEventListener('click', function() {
// //       this.classList.toggle('liked');
// //       const countSpan = this.querySelector('.likes-count');
// //       let count = parseInt(countSpan.textContent);
      
// //       if (this.classList.contains('liked')) {
// //         countSpan.textContent = count + 1;
// //       } else {
// //         countSpan.textContent = count - 1;
// //       }
// //     });
// //   });
  
// //   // 评论功能 - 可以扩展为弹出评论框
// //   document.querySelectorAll('.moments-comments').forEach(commentBtn => {
// //     commentBtn.addEventListener('click', function() {
// //       alert('评论功能开发中...');
// //     });
// //   });
// // });