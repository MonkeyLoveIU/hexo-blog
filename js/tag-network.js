(() => {
  'use strict';

  const VIS_NETWORK_SRC = 'https://unpkg.com/vis-network@9.1.6/standalone/umd/vis-network.min.js';
  let visLoader = null;

  const loadVisNetwork = () => {
    if (window.vis?.Network) return Promise.resolve();
    if (visLoader) return visLoader;

    visLoader = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${VIS_NETWORK_SRC}"]`);
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = VIS_NETWORK_SRC;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return visLoader;
  };

  const showError = (container) => {
    container.replaceChildren();
    const error = document.createElement('div');
    error.className = 'tag-network-error';
    error.textContent = '标签网络加载失败，请稍后再试。';
    container.appendChild(error);
  };

  const initTagNetwork = async () => {
    const container = document.getElementById('tag-network');
    if (!container || container.dataset.tagNetworkLoading === 'true') return;

    container.dataset.tagNetworkLoading = 'true';
    if (container.__tagNetworkInstance) {
      container.__tagNetworkInstance.destroy();
      container.__tagNetworkInstance = null;
    }

    try {
      await loadVisNetwork();

      const response = await fetch('/tag-network.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`tag-network.json ${response.status}`);

      const data = await response.json();
      const nodes = (data.nodes || []).map((node) => ({
        id: node.id,
        label: `${node.name} (${node.count})`,
        value: node.count,
        title: `${node.name}: ${node.count} 篇文章`,
        shape: 'dot',
        size: Math.max(20, Math.min(60, Number(node.count || 0) * 12)),
        color: {
          background: '#ff7c7c',
          border: '#ff5252',
          highlight: { background: '#ff5252', border: '#d32f2f' },
        },
        font: { color: '#666', size: 13, face: 'sans-serif' },
        borderWidth: 2,
      }));

      const edges = (data.edges || []).map((edge) => ({
        from: edge.source,
        to: edge.target,
        width: Math.max(1, Number(edge.weight || 1)),
        color: { color: 'rgba(255, 130, 130, 0.3)', highlight: '#ff5252', hover: '#ff5252' },
        smooth: { type: 'continuous' },
      }));

      container.replaceChildren();
      const network = new window.vis.Network(container, { nodes, edges }, {
        physics: {
          solver: 'forceAtlas2Based',
          forceAtlas2Based: {
            gravitationalConstant: -40,
            centralGravity: 0.005,
            springLength: 150,
            springConstant: 0.02,
          },
          stabilization: { iterations: 200 },
        },
        interaction: { hover: true, tooltipDelay: 100 },
        edges: { smooth: { type: 'continuous' } },
      });

      network.on('click', (params) => {
        if (!params.nodes.length) return;
        location.href = `/tags/${encodeURIComponent(params.nodes[0])}/`;
      });

      container.__tagNetworkInstance = network;
    } catch (error) {
      console.error('[tag-network] init failed:', error);
      showError(container);
    } finally {
      delete container.dataset.tagNetworkLoading;
    }
  };

  if (!window.__tagNetworkEventsBound) {
    window.__tagNetworkEventsBound = true;
    document.addEventListener('pjax:complete', initTagNetwork);
    document.addEventListener('pjax:end', initTagNetwork);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTagNetwork, { once: true });
  } else {
    initTagNetwork();
  }
})();
