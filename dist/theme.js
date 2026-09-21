// Apply the saved palette before CSS loads to avoid a flash of the other theme.
(() => {
  const root = document.documentElement;
  const key = 'porto-theme';
  const themes = [
    {id: 'dark', name: 'Dark', canvas: '#090a0a'},
    {id: 'light', name: 'Light', canvas: '#f4f0e7'},
    {id: 'dusk', name: 'Dusk', canvas: '#211c25'},
    {id: 'forest', name: 'Forest', canvas: '#15201b'},
    {id: 'ink', name: 'Ink', canvas: '#1b2026'}
  ];
  const normalize = value => themes.some(item => item.id === value) ? value : 'dark';
  const currentIndex = () => themes.findIndex(item => item.id === theme);
  const nextTheme = () => themes[(currentIndex() + 1) % themes.length];
  let theme = 'dark';
  try { theme = normalize(localStorage.getItem(key)); } catch {}
  const apply = value => {
    theme = normalize(value);
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = themes[currentIndex()].canvas;
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const current = themes[currentIndex()];
    const label = `${current.name} theme (${currentIndex() + 1} of ${themes.length}). Switch to ${nextTheme().name}`;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.querySelector('.theme-label').textContent = current.name;
    button.querySelector('.theme-count').textContent = `${currentIndex() + 1}/${themes.length}`;
  };
  apply(theme);
  document.addEventListener('DOMContentLoaded', () => {
    apply(theme);
    document.getElementById('theme-toggle').addEventListener('click', () => {
      apply(nextTheme().id);
      document.getElementById('theme-status').textContent = `${themes[currentIndex()].name} theme selected.`;
      try { localStorage.setItem(key, theme); } catch {
        document.getElementById('theme-status').textContent = 'Theme changed for this visit. Browser storage is unavailable.';
      }
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(event.newValue);
  });
})();
