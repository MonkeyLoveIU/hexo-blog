(function () {
  var state = {
    messages: [],
    searchIndex: null,
    loadingIndex: null,
    sending: false,
  };

  function config() {
    return (window.REIMU_CONFIG && window.REIMU_CONFIG.ai_chat) || {};
  }

  function stripHtml(value) {
    return String(value || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function words(text) {
    return Array.from(new Set(String(text || "").toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || []));
  }

  function renderMessage(role, text) {
    var list = document.getElementById("blog-ai-messages");
    if (!list) return;
    var item = document.createElement("div");
    item.className = "blog-ai-message " + role;
    var paragraph = document.createElement("p");
    paragraph.textContent = text;
    item.appendChild(paragraph);
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
  }

  function setPanel(open) {
    var panel = document.getElementById("blog-ai-panel");
    var toggle = document.getElementById("blog-ai-toggle");
    if (!panel || !toggle) return;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      var input = document.getElementById("blog-ai-input");
      input && input.focus();
    }
  }

  function loadSearchIndex() {
    if (state.searchIndex) return Promise.resolve(state.searchIndex);
    if (state.loadingIndex) return state.loadingIndex;
    var searchPath = config().search_path || "/search.json";
    state.loadingIndex = fetch(searchPath, { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("search index unavailable");
        return response.json();
      })
      .then(function (data) {
        var list = Array.isArray(data) ? data : data.posts || [];
        state.searchIndex = list.map(function (item) {
          var content = stripHtml(item.content || item.text || item.excerpt || "");
          return {
            title: stripHtml(item.title),
            url: item.url || item.path || "",
            summary: content.slice(0, 260),
            haystack: (stripHtml(item.title) + " " + content).toLowerCase(),
          };
        });
        return state.searchIndex;
      })
      .catch(function () {
        state.searchIndex = [];
        return state.searchIndex;
      });
    return state.loadingIndex;
  }

  function pickContext(query) {
    return loadSearchIndex().then(function (index) {
      var tokens = words(query);
      if (!tokens.length) return [];
      return index
        .map(function (item) {
          var score = tokens.reduce(function (sum, token) {
            return sum + (item.haystack.indexOf(token) > -1 ? 1 : 0);
          }, 0);
          return Object.assign({ score: score }, item);
        })
        .filter(function (item) { return item.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, 4)
        .map(function (item) {
          return { title: item.title, url: item.url, summary: item.summary };
        });
    });
  }

  function currentPage() {
    var title = document.querySelector("#logo h1") || document.querySelector("title");
    return {
      title: title ? title.textContent.trim() : document.title,
      url: window.location.href,
    };
  }

  function submitQuestion(question) {
    var cfg = config();
    if (!cfg.endpoint) {
      renderMessage("assistant", "AI 代理地址还没有配置。部署 Cloudflare Worker 或 Vercel Function 后，把 endpoint 填进主题配置即可。");
      return Promise.resolve();
    }
    if (state.sending) return Promise.resolve();
    state.sending = true;
    renderMessage("assistant", "我正在翻博客内容，稍等一下...");
    return pickContext(question)
      .then(function (context) {
        return fetch(cfg.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: state.messages.slice(-8),
            context: context,
            page: currentPage(),
          }),
        });
      })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok || data.error) throw new Error(data.error || "request failed");
          return data;
        });
      })
      .then(function (data) {
        var reply = data.reply || "我暂时没有拿到可用回复。";
        state.messages.push({ role: "assistant", content: reply });
        var placeholders = document.querySelectorAll(".blog-ai-message.assistant:last-child p");
        var last = placeholders[placeholders.length - 1];
        if (last && last.textContent.indexOf("我正在翻博客内容") === 0) {
          last.textContent = reply;
        } else {
          renderMessage("assistant", reply);
        }
      })
      .catch(function () {
        renderMessage("assistant", "这次请求失败了，稍后再试，或检查代理 endpoint 和环境变量。 ");
      })
      .finally(function () {
        state.sending = false;
      });
  }

  function init() {
    var root = document.getElementById("blog-ai-chat");
    if (!root) return;
    var toggle = document.getElementById("blog-ai-toggle");
    var close = document.getElementById("blog-ai-close");
    var form = document.getElementById("blog-ai-form");
    var input = document.getElementById("blog-ai-input");

    toggle && toggle.off && toggle.off("click");
    toggle && toggle.on("click", function () {
      var panel = document.getElementById("blog-ai-panel");
      setPanel(panel ? panel.hidden : true);
    });

    close && close.off && close.off("click");
    close && close.on("click", function () { setPanel(false); });

    document.querySelectorAll("#blog-ai-suggestions button").forEach(function (button) {
      button.off && button.off("click");
      button.on("click", function () {
        if (!input) return;
        input.value = button.dataset.suggestion || button.textContent;
        input.focus();
      });
    });

    form && form.off && form.off("submit");
    form && form.on("submit", function (event) {
      event.preventDefault();
      var question = input ? input.value.trim() : "";
      if (!question) return;
      input.value = "";
      state.messages.push({ role: "user", content: question });
      renderMessage("user", question);
      submitQuestion(question);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  document.addEventListener("pjax:complete", init);
  document.addEventListener("pjax:success", init);
})();