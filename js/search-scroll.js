(function() {
  var query = sessionStorage.getItem("reimu_search_query");
  var occurrenceNum = parseInt(sessionStorage.getItem("reimu_search_occurrence"), 10);
  sessionStorage.removeItem("reimu_search_query");
  sessionStorage.removeItem("reimu_search_occurrence");
  if (!query || isNaN(occurrenceNum)) return;

  setTimeout(function() {
    var text = query.toLowerCase();
    var article = document.querySelector(".post-content, article, .content");
    if (!article) return;

    // 遍历 DOM 文本节点，找到第 N 个匹配
    var treeWalker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, null, false);
    var count = 0;
    while (treeWalker.nextNode()) {
      var node = treeWalker.currentNode;
      var lowerText = node.textContent.toLowerCase();
      var idx = 0;
      while ((idx = lowerText.indexOf(text, idx)) !== -1) {
        if (count === occurrenceNum) {
          var range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + text.length);
          var mark = document.createElement("mark");
          mark.style.backgroundColor = "#ff5252";   // 主题深红色
          mark.style.color = "#fff";
          mark.style.padding = "2px 4px";
          mark.style.borderRadius = "3px";
          mark.style.fontStyle = "normal";
          range.surroundContents(mark);
          mark.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        count++;
        idx += text.length;
      }
    }
  }, 500);
})();