const DEFAULT_BASE_URL = 'http://localhost:3000';
const input = document.getElementById('baseUrl');
const status = document.getElementById('status');

function normalizeBaseUrl(value) {
  try {
    const url = new URL(value || DEFAULT_BASE_URL);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Use http or https only.');
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Invalid URL.');
  }
}

chrome.storage.sync.get('baseUrl').then(({ baseUrl }) => { input.value = baseUrl || DEFAULT_BASE_URL; });
document.getElementById('save').addEventListener('click', async () => {
  try {
    const baseUrl = normalizeBaseUrl(input.value.trim());
    await chrome.storage.sync.set({ baseUrl });
    input.value = baseUrl;
    status.textContent = 'Saved.';
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Invalid URL.';
  }
});
