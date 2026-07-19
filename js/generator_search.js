(() => {
  const searchInput = _$("#reimu-search-input");
  const searchResult = _$("#reimu-hits");
  const pagination = _$("#reimu-pagination");
  const itemsPerPage = 10;
  let currentPage = 1;

  function getSnippet(text, keyword, contextLen) {
    if (contextLen === void 0) contextLen = 30;
    var lower = text.toLowerCase();
    var kwLower = keyword.toLowerCase();
    var idx = lower.indexOf(kwLower);
    if (idx === -1) return "";
    var start = Math.max(0, idx - contextLen);
    var end = Math.min(text.length, idx + keyword.length + contextLen);
    var snippet = text.slice(start, end);
    if (start > 0) snippet = "\u2026" + snippet;
    if (end < text.length) snippet = snippet + "\u2026";
    var escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var re = new RegExp("(" + escaped + ")", "gi");
    snippet = snippet.replace(re, "<mark class=\"search-highlight\">$1</mark>");
    return snippet;
  }


  function findAllOccurrences(text, keyword, maxResults) {
    if (maxResults === void 0) maxResults = 10;
    var lower = text.toLowerCase();
    var kwLower = keyword.toLowerCase();
    var results = [];
    var idx = 0;
    var occurrenceNum = 0;
    while ((idx = lower.indexOf(kwLower, idx)) !== -1) {
      var contextLen = 40;
      var start = Math.max(0, idx - contextLen);
      var end = Math.min(text.length, idx + keyword.length + contextLen);
      var snippet = text.slice(start, end);
      if (start > 0) snippet = "\u2026" + snippet;
      if (end < text.length) snippet = snippet + "\u2026";
      var escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var re = new RegExp("(" + escaped + ")", "gi");
      snippet = snippet.replace(re, "<mark class=\"search-highlight\">$1</mark>");

      results.push({ snippet: snippet, occurrenceNum: occurrenceNum });
      occurrenceNum++;
      idx += keyword.length;
      if (results.length >= maxResults) break;
    }
    return results;
  }



  function displayHits(hits, page, itemsPerPage, query) {
    searchResult.innerHTML = "";
    var start = (page - 1) * itemsPerPage;
    var end = start + itemsPerPage;

    // 把每个文章的每个匹配位置展平成一条结果
    var flatResults = [];
    hits.forEach(function(hit) {
      var titleMatch = hit.title && hit.title.toLowerCase().includes(query.toLowerCase());
      // 标题匹配的放一条
      if (titleMatch) {
        flatResults.push({ hit: hit, snippet: null, occurrenceNum: -1 });
      }
      // 正文每个匹配位置各放一条
      if (hit.content) {
        var occs = findAllOccurrences(hit.content, query);
        occs.forEach(function(occ) {
          flatResults.push({ hit: hit, snippet: occ.snippet, occurrenceNum: occ.occurrenceNum });
        });
      }
    });

    flatResults.slice(start, end).forEach(function(item) {
      var el = document.createElement("div");
      el.className = "reimu-hit-item";
      el.innerHTML =
        '<a href="' + item.hit.url + '" class="reimu-hit-item-link">' + item.hit.title + '</a>' +
        (item.snippet ? '<p class="reimu-hit-snippet">' + item.snippet + '</p>' : "");

      el.querySelector("a").addEventListener("click", function(e) {
        e.preventDefault();
        // 关弹窗
        _$(".popup").classList.remove("show");
        _$("#mask").classList.add("hide");
        _$("#container").style.marginRight = "";
        _$("#header-nav").style.marginRight = "";
        document.body.style.overflow = "";
        // 存搜索词和匹配序号
        sessionStorage.setItem("reimu_search_query", query);
        sessionStorage.setItem("reimu_search_occurrence", item.occurrenceNum);
        window.location.href = this.getAttribute("href");
      });

      searchResult.appendChild(el);
    });
  }
  searchInput.insertAdjacentHTML(
    "beforeend",
    "<form id=\"search-form\"><input type=\"text\" id=\"search-text\"></form>"
  );
  fetch("/search.json")
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then(function(data) {
      var performSearch = function() {
        var inputText = _$("#search-text").value;
        searchResult.innerHTML = "";
        pagination.innerHTML = "";
        if (inputText) {
          var hits = data.filter(function(post) {
            return (
              (post.title &&
                post.title.toLowerCase().includes(inputText.toLowerCase())) ||
              (post.content &&
                post.content.toLowerCase().includes(inputText.toLowerCase()))
            );
          });

          var totalPages = Math.ceil(hits.length / itemsPerPage);
          pagination.insertAdjacentHTML(
            "beforeend",
            "<ul class=\"ais-Pagination-list pagination\">"
          );
          for (var i = 1; i <= totalPages; i++) {
            var pageItem = document.createElement("li");
            pageItem.className =
              "ais-Pagination-item pagination-item ais-Pagination-item--page";
            pageItem.innerHTML = "<a class=\"ais-Pagination-link page-number\" aria-label=\"Page " + i + "\" href=\"#\">" + i + "</a>";
            if (i === currentPage) {
              pageItem.classList.add(
                "ais-Pagination-item--selected",
                "current"
              );
            }
            pagination.querySelector("ul").appendChild(pageItem);
          }

          _$$(".page-number").forEach(function(element) {
            element.off("click").on("click", function(event) {
              event.preventDefault();
              currentPage = parseInt(element.innerText, 10);
              _$$(".ais-Pagination-item").forEach(function(element) {
                element.classList.remove(
                  "ais-Pagination-item--selected",
                  "current"
                );
              });
              element.parentNode.classList.add(
                "ais-Pagination-item--selected",
                "current"
              );
              displayHits(hits, currentPage, itemsPerPage, inputText);
            });
          });

          displayHits(hits, currentPage, itemsPerPage, inputText);
        }
      };

      _$("#search-form")
        .off("submit")
        .on("submit", function(event) {
          event.preventDefault();
          performSearch();
        });

      _$("#search-text").addEventListener("input", function() {
        currentPage = 1;
        performSearch();
      });
    })
    .catch(function(error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });

  _$(".popup-trigger")
    .off("click")
    .on("click", function(event) {
      event.stopPropagation();
      var scrollWidth =
        window.innerWidth - document.documentElement.offsetWidth;
      _$("#container").style.marginRight = scrollWidth + "px";
      _$("#header-nav").style.marginRight = scrollWidth + "px";
      _$(".popup").classList.add("show");
      _$("#mask").classList.remove("hide");
      document.body.style.overflow = "hidden";
      _$("#search-text").focus();
    });

  const closeSearchPopup = function() {
    _$(".popup").classList.remove("show");
    _$("#mask").classList.add("hide");
    _$("#container").style.marginRight = "";
    _$("#header-nav").style.marginRight = "";
    document.body.style.overflow = "";
  };

  _$(".popup-btn-close")
    .off("click")
    .on("click", closeSearchPopup);

  window.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && _$(".popup").classList.contains("show")) {
      closeSearchPopup();
    }
  });

  _$("#mask")?.addEventListener("click", function() {
    if (_$(".popup").classList.contains("show")) {
      closeSearchPopup();
    }
  });
})();
