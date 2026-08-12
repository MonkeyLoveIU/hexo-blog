import { j as mount, N as unmount } from './client.BO3Dqttv.js';
import Visualizer from './MusicVisualizer.CKaXxCYN.js';

(function () {
  var host = document.getElementById('music-visualizer-root');
  if (!host) return;

  var app = mount(Visualizer, { target: host, props: {} });

  window.addEventListener('beforeunload', function () {
    try { unmount(app); } catch (e) {}
  });
})();