(function (window, document) {
  const clientId = 'ko4bfmx40fhecmvvzdxu05buhz5wdf';
  const streamTemplate = document.querySelector('.stream-template').innerText;
  const pagingTemplate = document.querySelector('.paging-template').innerText;

  let scriptEl;
  let query;
  let offset;
  let total;

  const searchResultsEl = document.querySelector('.search-results');

  document.querySelector('.search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    query = document.querySelector('.search-form__query').value;
    if (!query) return;
    offset = 0;
    doSearch();
  });

  searchResultsEl.addEventListener('click', function (e) {
    if (e.target.className === 'page-next' && (offset + 10 < total)) {
      offset += 10;
    } else if (e.target.className === 'page-prev' && (offset - 10 >= 0)) {
      offset -= 10;
    } else return;
    doSearch();
  });

  function doSearch() {
    const url = `https://api.twitch.tv/kraken/search/streams?callback=apiCallback&client_id=${clientId}&query=${encodeURIComponent(query)}&offset=${offset}`;
    scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', url);
    document.body.appendChild(scriptEl);
    searchResultsEl.innerHTML = '<h4>Searching…</h4>';
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
        currentPage: (offset / 10) + 1,
        totalPages: Math.ceil(results._total / 10)
      });
      streams.forEach(stream => {
        html += render(streamTemplate, {
          img: stream.preview.medium,
          title: stream.channel.display_name,
          status: stream.channel.status,
          viewerCount: stream.viewers,
          game: stream.game,
        });
      });
      searchResultsEl.innerHTML = html;
    }
  };
})(window, document);
