const DEFAULT_BASE_URL = 'http://localhost:3000';

function normalizeBaseUrl(value) {
  try {
    const url = new URL(value || DEFAULT_BASE_URL);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return DEFAULT_BASE_URL;
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_BASE_URL;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'humanize-selection', title: 'Humanize with StealthHumanizer', contexts: ['selection'] });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'humanize-selection' || !info.selectionText) return;
  const { baseUrl = DEFAULT_BASE_URL } = await chrome.storage.sync.get('baseUrl');
  const url = new URL(normalizeBaseUrl(baseUrl));
  url.searchParams.set('text', info.selectionText.slice(0, 10000));
  await chrome.tabs.create({ url: url.toString() });
});
