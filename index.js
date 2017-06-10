(function (window, document, history) {
  const clientId = 'ko4bfmx40fhecmvvzdxu05buhz5wdf';
  const streamTemplate = document.querySelector('.stream-template').innerText;
  const pagingTemplate = document.querySelector('.paging-template').innerText;
  const searchResultsEl = document.querySelector('.search-results');

  const hashMatch = location.hash.match(/#q=([^&]*)&page=(\d*)/);
  let scriptEl;
  let query = hashMatch && decodeURIComponent(hashMatch[1]);
  let page = hashMatch && +hashMatch[2];
  let total;

  if (query) doSearch();

  document.querySelector('.search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    query = document.querySelector('.search-form__query').value;
    if (!query) return;
    page = 1;
    doSearch();
  });

  searchResultsEl.addEventListener('click', function (e) {
    if (e.target.className === 'page-next' && (page * 10 <= total)) {
      page += 1;
    } else if (e.target.className === 'page-prev' && (page - 1 > 0)) {
      page -= 1;
    } else return;

    doSearch();
  });

  function doSearch() {
    const encodedQuery = encodeURIComponent(query);
    const offset = (page - 1) * 10;
    const url = `https://api.twitch.tv/kraken/search/streams?callback=apiCallback&client_id=${clientId}&query=${encodedQuery}&offset=${offset}`;
    scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', url);
    document.body.appendChild(scriptEl);
    searchResultsEl.innerHTML = '<h4>Searching…</h4>';
    history.replaceState(null, null, `#q=${encodedQuery}&page=${page}`);
  }

  function render(str, obj) {
    // Find {…}, and remove surrounding curlies
    const keys = str.match(/{\s*\w+\s*}/g).map(key => key.slice(1,-1));

    // For each key found in the template, replace it with val from obj
    return keys.reduce((result, key) => {
      return result.replace(`{${key}}`, obj[key.trim()]);
    }, str);
  }

  window.apiCallback = function (results) {
    const { streams } = results;
    let html = '';
    scriptEl.remove();

    total = results._total;

    if (!streams.length) {
      searchResultsEl.innerHTML = '<h4>No results found</h4>';
    } else {
      html += render(pagingTemplate, {
        total: results._total,
        currentPage: page,
        totalPages: Math.ceil(results._total / 10)
      });
      streams.forEach(stream => {
        html += render(streamTemplate, {
          img: stream.preview.medium,
          title: stream.channel.display_name,
          status: stream.channel.status,
          viewerCount: stream.viewers,
          game: stream.game,
          link: stream.channel.url,
        });
      });
      searchResultsEl.innerHTML = html;
    }
  };
})(window, document, history);
