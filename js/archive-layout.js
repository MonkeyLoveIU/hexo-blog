document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('moments-container');
  if (!container) return;

  const toggleBtns = document.querySelectorAll('.layout-toggle-btn');
  const storedLayout = localStorage.getItem('archive-layout') || 'grid'; 
  
  // Initialize layout
  setLayout(storedLayout);

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const layout = e.currentTarget.dataset.layout;
      if (layout) {
        setLayout(layout);
        localStorage.setItem('archive-layout', layout);
      }
    });
  });

  function setLayout(layoutName) {
    // Set container attribute
    container.setAttribute('data-layout', layoutName);
    
    // Update button active states
    toggleBtns.forEach(btn => {
      if (btn.dataset.layout === layoutName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
});
