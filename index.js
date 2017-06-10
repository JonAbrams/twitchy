(function (window, document) {
  const clientId = 'ko4bfmx40fhecmvvzdxu05buhz5wdf';
  const streamTemplate = document.querySelector('.stream-template').innerText;

  let scriptEl;

  const searchResultsEl = document.querySelector('.search-results');
  const noSearchResultsEl = document.querySelector('.no-search-results');

  document.querySelector('.search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.querySelector('.search-form__query').value;
    if (!query) return;
    doSearch(query);
  });

  function doSearch(query) {
    const url = `https://api.twitch.tv/kraken/search/streams?callback=apiCallback&client_id=${clientId}&query=${encodeURIComponent(query)}`;
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

  window.apiCallback = function ({ streams }) {
    let html = '';
    scriptEl.remove();

    if (streams.length === 0) {
      searchResultsEl.innerHTML = '<h4>No results found</h4>';
    } else {
      streams.forEach(stream => {
        stream.img = stream.preview.medium;
        stream.title = stream.channel.display_name;
        stream.status = stream.channel.status;
        html += render(streamTemplate, stream);
      });
      searchResultsEl.innerHTML = html;
    }
  };
})(window, document);
