import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../dist/theme.js', import.meta.url), 'utf8');
function boot(value, blocked = false) {
  const store = new Map(value === undefined ? [] : [['porto-theme', value]]);
  const events = {}, buttonEvents = {}, dataset = {}, label = {}, status = {}, meta = {};
  const attrs = {};
  let ready = false;
  const button = {setAttribute: (key, val) => attrs[key] = val, querySelector: () => label,
    addEventListener: (key, fn) => buttonEvents[key] = fn};
  const document = {documentElement: {dataset}, querySelector: () => meta,
    getElementById: id => id === 'theme-status' ? status : ready ? button : null,
    addEventListener: (name, fn) => events[name] = fn};
  vm.runInNewContext(source, {document,
    window: {addEventListener: (name, fn) => events[name] = fn},
    localStorage: {
      getItem: key => {if (blocked) throw Error('blocked'); return store.get(key) ?? null;},
      setItem: (key, val) => {if (blocked) throw Error('blocked'); store.set(key, val);}
    }});
  const beforeReady = dataset.theme;
  ready = true; events.DOMContentLoaded();
  return {dataset, attrs, store, status, meta, beforeReady, click: buttonEvents.click, storage: events.storage};
}
const fresh = boot();
assert.equal(fresh.beforeReady, 'dark');
fresh.click();
assert.equal(fresh.dataset.theme, 'light');
assert.equal(fresh.attrs['aria-label'], 'Switch to dark mode');
assert.equal(fresh.meta.content, '#f4f0e7');
const reload = boot(fresh.store.get('porto-theme'));
assert.equal(reload.beforeReady, 'light');
reload.click();
assert.equal(reload.store.get('porto-theme'), 'dark');
reload.storage({key: 'porto-theme', newValue: 'light'});
assert.equal(reload.dataset.theme, 'light');
reload.storage({key: 'porto-saved', newValue: 'dark'});
assert.equal(reload.dataset.theme, 'light');
reload.storage({key: null, newValue: null});
assert.equal(reload.dataset.theme, 'dark');
assert.equal(boot('invalid').beforeReady, 'dark');
const blocked = boot(undefined, true);
blocked.click();
assert.equal(blocked.dataset.theme, 'light');
assert.match(blocked.status.textContent, /for this visit/);
console.log('PASS: pre-paint theme, toggle, reload, cross-tab changes, reset, invalid values and unavailable storage. DOM/storage simulated.');
