(function() {
  window.addEventListener("pjax:send", () => {
    document.body.classList.remove("is-revealing");
    document.body.classList.add("is-transitioning");
  });

  window.addEventListener("pjax:complete", () => {
    // Wait for the transition out to complete its coverage
    setTimeout(() => {
      document.body.classList.remove("is-transitioning");
      document.body.classList.add("is-revealing");
      
      // Reset layers after animation
      setTimeout(() => {
        document.body.classList.remove("is-revealing");
        const layers = document.querySelectorAll('.transition-layer');
        layers.forEach(layer => {
          layer.style.transition = 'none';
          layer.style.transform = 'translateY(100%)';
          void layer.offsetWidth; // force reflow
          layer.style.transition = '';
        });
      }, 800);
    }, 300); // 300ms delay to ensure the screen is covered before revealing
  });
})();
