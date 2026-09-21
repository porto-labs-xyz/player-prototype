// Apply the saved palette before CSS loads to avoid a flash of the other theme.
(() => {
  const root = document.documentElement;
  const key = 'porto-theme';
  const normalize = value => value === 'light' ? 'light' : 'dark';
  let theme = 'dark';
  try { theme = normalize(localStorage.getItem(key)); } catch {}
  const apply = value => {
    theme = normalize(value);
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#f4f0e7' : '#090a0a';
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.querySelector('.theme-label').textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  };
  apply(theme);
  document.addEventListener('DOMContentLoaded', () => {
    apply(theme);
    document.getElementById('theme-toggle').addEventListener('click', () => {
      apply(theme === 'dark' ? 'light' : 'dark');
      try { localStorage.setItem(key, theme); } catch {
        document.getElementById('theme-status').textContent = 'Theme changed for this visit. Browser storage is unavailable.';
      }
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(event.newValue);
  });
})();
