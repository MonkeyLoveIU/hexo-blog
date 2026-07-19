document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('color-theme-btn');
  const themeOptions = document.getElementById('color-theme-options');
  const themeItems = themeOptions ? themeOptions.querySelectorAll('li') : [];
  const selectedThemeSpan = document.getElementById('selected-color-theme');

  if (!themeBtn || !themeOptions) return;

  // Init UI from current state
  const currentTheme = document.documentElement.getAttribute('data-color-theme') || 'warm';
  
  const updateUI = (theme) => {
    themeItems.forEach(item => {
      item.classList.remove('selected');
      if (item.getAttribute('data-value') === theme) {
        item.classList.add('selected');
        if (selectedThemeSpan) {
          selectedThemeSpan.textContent = item.textContent;
        }
      }
    });
  };

  updateUI(currentTheme);

  // Toggle Dropdown
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeOptions.classList.toggle('show');
  });

  // Select Theme
  themeItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const newTheme = item.getAttribute('data-value');
      
      // Update HTML attribute
      document.documentElement.setAttribute('data-color-theme', newTheme);
      
      // Save to localStorage
      localStorage.setItem('color-theme', newTheme);
      
      // Update UI
      updateUI(newTheme);
      
      // Close Dropdown
      themeOptions.classList.remove('show');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('#theme-nav')) {
      themeOptions.classList.remove('show');
    }
  });
});
