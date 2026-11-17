const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const test = require('node:test');
const {webcrypto} = require('node:crypto');

const source = fs.readFileSync(process.env.STORES_CONSOLE_SOURCE || path.join(__dirname, '../index.html'), 'utf8');
const section = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const feed = () => ({schema: 1, revision: 7, validUntil: '2027-11-17T00:00:00Z', notices: [], appearance: null});
const denied = (status = 403, message = 'Resource not accessible by personal access token', headers = {}) => ({status, message, headers});
const deferred = () => {let resolve; const promise = new Promise(r => {resolve = r;}); return {promise, resolve};};
const response = (data, status = 200, headers = {}) => ({ok: status >= 200 && status < 300, status, headers: {get: key => headers[key.toLowerCase()] ?? null}, json: async () => data});

function harness() {
  const elements = new Map(), saved = new Map(), listeners = new Map(), calls = [];
  const remote = {state: feed(), sha: 'feed-7', tree: 'tree-7', commit: 'commit-7'};
  const controls = {probeError: null, putError: null, intercept: null};
  const $ = id => {
    if (!elements.has(id)) elements.set(id, {value: '', hidden: false, disabled: false, textContent: '', addEventListener() {}, scrollIntoView() {this.scrolled = true;}, focus() {this.focused = true;}});
    return elements.get(id);
  };
  const context = {
    $, Date, JSON, Error, Map, Set, TextEncoder, TextDecoder, Uint8Array, structuredClone, URL,
    crypto: webcrypto,
    atob: value => Buffer.from(value, 'base64').toString('binary'),
    btoa: value => Buffer.from(value, 'binary').toString('base64'),
    localStorage: {getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key)},
    document: {addEventListener: (type, callback) => listeners.set(type, callback)},
    window: {addEventListener() {}, open() {}},
    fetch: async (url, options) => {
      const endpoint = new URL(url).pathname.split('/stores-mobile-updates/')[1];
      const call = {endpoint, url, method: options.method, body: options.body && JSON.parse(options.body), token: options.headers.Authorization};
      calls.push(call);
      if (controls.intercept) {const result = controls.intercept(call); if (result) return result;}
      if (endpoint === 'git/ref/heads/main') return response({object: {sha: remote.commit}});
      if (endpoint.startsWith('git/commits/')) return response({tree: {sha: remote.tree}});
      if (endpoint.startsWith('git/trees/')) return response({tree: [{path: 'config.json', mode: '100644', type: 'blob', sha: remote.sha}]});
      if (endpoint === 'git/trees') return controls.probeError
        ? response({message: controls.probeError.message}, controls.probeError.status, controls.probeError.headers)
        : response({sha: remote.tree});
      if (endpoint === 'contents/config.json' && options.method === 'GET') return response({sha: remote.sha, content: Buffer.from(JSON.stringify(remote.state)).toString('base64')});
      if (options.method === 'PUT' && controls.putError) return response({message: controls.putError.message}, controls.putError.status, controls.putError.headers);
      if (endpoint === 'contents/config.json' && options.method === 'PUT') {
        remote.state = JSON.parse(Buffer.from(call.body.content, 'base64').toString());
        remote.sha = 'published-feed';
        return response({content: {sha: remote.sha}});
      }
      if (endpoint === 'contents/print-templates.json' && options.method === 'GET') return response({message: 'Not Found'}, 404);
      if (options.method === 'PUT') return response({content: {sha: 'artwork-or-template'}});
      throw Error('Unexpected mock endpoint: ' + endpoint);
    }
  };
  vm.createContext(context);
  vm.runInContext("const repo='tarekdev33-ops/stores-mobile-updates';let auth='',sha=null,state=" + JSON.stringify(feed()) + ",noticeImageUrl='',iconImageUrl='',nameImageUrl='';const uploads=new Map();let loads=0;function status(s){$('status').textContent=s}function validate(){}function update(){}function load(s){state=s;loads++}function fresh(){$('title').value=''}", context);
  for (const script of [
    section('function githubFailureKind(', 'function decode('),
    section('function decode(', 'function load('),
    section("const publishTokenKey=", "$('export').onclick"),
    section('async function uploadReferenced(', 'function selectedBrand('),
    section('let printPublishing=', "fresh();dates('appearance')")
  ]) vm.runInContext(script, context);
  const run = code => vm.runInContext(code, context);
  return {
    $, run, calls, remote, controls, saved,
    connect: (token = 'synthetic-owner-token') => run('connectPublisher(' + JSON.stringify(token) + ')'),
    publish: () => $('publish').onclick(),
    edit() {run("state.notices.push({id:'pending',imageUrl:'https://example.test/pending.webp'});uploads.set('https://example.test/pending.webp',{path:'assets/campaigns/pending.webp',content:'c3ludGhldGlj',preview:'blob:synthetic'});noticeImageUrl='https://example.test/pending.webp'"); $('title').value = 'unsaved form text'; listeners.get('input')({target: {id: 'title'}});},
    snapshot: () => JSON.parse(run('JSON.stringify({auth,sha,state,baseSha,baseContent,writeReady,uploads:[...uploads],noticeImageUrl,loads})'))
  };
}

test('connection proves write permission with an identical tree and does not publish', async () => {
  const h = harness();
  await h.connect();
  const probe = h.calls.find(call => call.endpoint === 'git/trees');
  assert.deepEqual(probe.body, {base_tree: 'tree-7', tree: [{path: 'config.json', mode: '100644', type: 'blob', sha: 'feed-7'}]});
  assert.match(h.calls.find(call => call.endpoint === 'contents/config.json').url, /\?ref=commit-7$/);
  assert.equal(h.calls.some(call => call.method === 'PUT'), false);
  assert.equal(h.$('publish').disabled, false);
  assert.equal(h.$('token').hidden, true);
  assert.equal(h.saved.size, 1);
});

test('a read-only token can read public content but is rejected before saving or enabling Publish', async () => {
  const h = harness(); h.controls.probeError = denied(); h.edit();
  const before = h.snapshot(); await h.connect();
  assert.ok(h.calls.some(call => call.endpoint === 'contents/config.json'));
  assert.equal(h.saved.size, 0);
  assert.equal(h.$('token').hidden, false);
  assert.equal(h.$('token').focused, true);
  assert.equal(h.$('token').scrolled, true);
  assert.equal(h.$('publish').disabled, true);
  assert.deepEqual(h.snapshot().state, before.state);
  assert.deepEqual(h.snapshot().uploads, before.uploads);
  assert.equal(h.$('title').value, 'unsaved form text');
});

for (const status of [401, 403]) test('HTTP ' + status + ' credential rejection preserves draft and recovers with a replacement token', async () => {
  const h = harness(); await h.connect(); h.edit(); const before = h.snapshot();
  h.controls.putError = denied(status); await h.publish();
  assert.equal(h.saved.size, 0); assert.equal(h.$('publish').disabled, true); assert.equal(h.$('token').hidden, false);
  assert.deepEqual(h.snapshot().state, before.state); assert.deepEqual(h.snapshot().uploads, before.uploads);
  h.controls.putError = null; await h.connect('synthetic-replacement-token');
  assert.deepEqual(h.snapshot().state, before.state); assert.equal(h.$('title').value, 'unsaved form text');
  assert.equal(h.snapshot().noticeImageUrl, before.noticeImageUrl);
  assert.equal(h.$('publish').disabled, false);
  await h.publish(); assert.equal(h.remote.state.notices[0].id, 'pending');
});

for (const failure of [
  denied(403, 'API rate limit exceeded', {'x-ratelimit-remaining': '0'}),
  denied(403, 'Secondary rate limit', {'retry-after': '60'}),
  denied(403, 'Resource protected by organization SAML enforcement', {'x-github-sso': 'required'}),
  denied(403, 'Changes must be made through a pull request: protected branch'),
  denied(403, 'Repository ruleset prevents updates'),
  denied(403, 'Unknown temporary restriction')
]) test('non-credential refusal retains the saved token: ' + failure.message, async () => {
  const h = harness(); await h.connect(); h.controls.putError = failure; await h.publish();
  assert.equal(h.saved.size, 1); assert.equal(h.snapshot().auth, 'synthetic-owner-token');
  assert.equal(h.$('token').hidden, true); assert.equal(h.$('publish').disabled, false);
});

test('reconnect retains draft and form values when content is unchanged despite a new blob SHA', async () => {
  const h = harness(); await h.connect(); h.edit(); const before = h.snapshot();
  h.run('disconnectPublisher()'); h.remote.sha = 'equivalent-blob'; await h.connect();
  assert.deepEqual(h.snapshot().state, before.state); assert.equal(h.snapshot().sha, 'equivalent-blob');
  assert.equal(h.$('title').value, 'unsaved form text'); assert.deepEqual(h.snapshot().uploads, before.uploads);
});

test('a delayed anonymous load preserves edited draft, images and fields and records their remote baseline', async () => {
  const h = harness(), waiting = deferred();
  const anonymous = waiting.promise.then(remote => h.run('acceptAnonymousFile(' + JSON.stringify(remote) + ',0)'));
  h.edit(); const before = h.snapshot(); waiting.resolve(h.remote.state); await anonymous;
  assert.deepEqual(h.snapshot().state, before.state); assert.deepEqual(h.snapshot().uploads, before.uploads);
  assert.equal(h.$('title').value, 'unsaved form text');
  assert.deepEqual(JSON.parse(h.snapshot().baseContent), h.remote.state);
  await h.connect();
  assert.deepEqual(h.snapshot().state, before.state); assert.equal(h.$('publish').disabled, false);
  assert.equal(h.$('title').value, 'unsaved form text');
});

test('a late anonymous response cannot replace an authenticated session baseline', async () => {
  const h = harness(); await h.connect(); const before = h.snapshot();
  h.run('acceptAnonymousFile(' + JSON.stringify({...feed(), revision: 1}) + ',0)');
  assert.deepEqual(h.snapshot(), before);
});

test('a concurrent remote change blocks publishing until explicit reload, preserving the draft meanwhile', async () => {
  const h = harness(); await h.connect(); h.edit(); const before = h.snapshot();
  h.remote.sha = 'concurrent-feed'; h.remote.state.revision = 8;
  await h.connect();
  assert.equal(h.$('publish').disabled, true); assert.equal(h.$('reloadPublished').hidden, false);
  assert.deepEqual(h.snapshot().state, before.state); assert.equal(h.$('title').value, 'unsaved form text');
  await h.$('reloadPublished').onclick();
  assert.equal(h.snapshot().state.revision, 8); assert.equal(h.snapshot().uploads.length, 0);
  assert.equal(h.$('title').value, ''); assert.equal(h.$('publish').disabled, false);
});

test('a failed identical-tree check never enables writes', async () => {
  const h = harness(); h.controls.intercept = call => call.endpoint === 'git/trees' ? response({sha: 'unexpected-tree'}) : null;
  await h.connect(); assert.equal(h.$('publish').disabled, true); assert.equal(h.saved.size, 0);
});

test('a late connection response cannot replace a newer connection', async () => {
  const h = harness(), waiting = deferred();
  h.controls.intercept = call => call.endpoint === 'git/ref/heads/main' && call.token.endsWith('synthetic-first-token') ? waiting.promise : null;
  const first = h.connect('synthetic-first-token'); await h.connect('synthetic-second-token');
  const before = h.snapshot(), status = h.$('status').textContent;
  waiting.resolve(response({object: {sha: 'old-commit'}})); await first;
  assert.deepEqual(h.snapshot(), before); assert.equal(h.$('status').textContent, status);
});

test('a stale reload cannot overwrite the replacement session or leave its recovery button disabled', async () => {
  const h = harness(), waiting = deferred(); await h.connect(); h.edit();
  h.remote.sha = 'concurrent-feed'; h.remote.state.revision = 8; await h.connect();
  h.controls.intercept = call => call.endpoint === 'contents/config.json' && call.url.endsWith('?ref=main') ? waiting.promise : null;
  const reloading = h.$('reloadPublished').onclick();
  h.run('disconnectPublisher()'); await h.connect('synthetic-new-session');
  const before = h.snapshot(); waiting.resolve(response({sha: 'stale-feed', content: Buffer.from(JSON.stringify(feed())).toString('base64')})); await reloading;
  assert.deepEqual(h.snapshot(), before); assert.equal(h.$('reloadPublished').hidden, false);
  assert.equal(h.$('reloadPublished').disabled, false); assert.equal(h.$('title').value, 'unsaved form text');
});

for (const late of [response({content: {sha: 'late-publish'}}), response({message: 'Resource not accessible by personal access token'}, 403)]) test('a late publish result cannot mutate or reject a replacement session: ' + late.status, async () => {
  const h = harness(), waiting = deferred(); await h.connect();
  h.controls.intercept = call => call.endpoint === 'contents/config.json' && call.method === 'PUT' ? waiting.promise : null;
  const publishing = h.publish(); await Promise.resolve(); await Promise.resolve();
  h.run('disconnectPublisher()'); await h.connect('synthetic-new-session');
  const before = h.snapshot(), status = h.$('status').textContent;
  waiting.resolve(late); await publishing;
  assert.deepEqual(h.snapshot(), before); assert.equal(h.$('status').textContent, status);
  assert.equal(h.saved.size, 1); assert.equal(h.$('publish').disabled, false);
});

test('logout during an artwork upload stops subsequent feed writes and local upload bookkeeping', async () => {
  const h = harness(), waiting = deferred(); await h.connect(); h.edit();
  h.controls.intercept = call => call.endpoint.startsWith('contents/assets/campaigns/') ? waiting.promise : null;
  const publishing = h.publish(); await Promise.resolve();
  h.run('disconnectPublisher()'); waiting.resolve(response({content: {sha: 'late-image'}})); await publishing;
  assert.equal(h.calls.some(call => call.method === 'PUT' && call.endpoint === 'contents/config.json'), false);
  assert.equal(h.snapshot().uploads[0][1].uploaded, undefined); assert.equal(h.$('publish').disabled, true);
});

test('the printer publisher also rejects credentials and cannot continue after logout', async () => {
  const h = harness(); await h.connect(); h.controls.putError = denied();
  const template = JSON.stringify({stores: {schema: 1, id: 'sample', kind: 'sale', paper: 'a4', name: 'Synthetic'}});
  await assert.rejects(h.run('window.storesPrintPublisher.publish(' + JSON.stringify(template) + ')'));
  assert.equal(h.saved.size, 0); assert.equal(h.$('token').hidden, false);
  await assert.rejects(h.run('window.storesPrintPublisher.publish(' + JSON.stringify(template) + ')'));
  assert.equal(h.calls.filter(call => call.method === 'PUT').length, 1);
});

test('logout during print template upload prevents a later catalog write', async () => {
  const h = harness(), waiting = deferred(), enteredUpload = deferred(); await h.connect();
  h.controls.intercept = call => {
    if (call.endpoint.startsWith('contents/assets/print-templates/')) {enteredUpload.resolve(); return waiting.promise;}
    return null;
  };
  const template = JSON.stringify({stores: {schema: 1, id: 'sample', kind: 'sale', paper: 'a4', name: 'Synthetic'}});
  const publishing = h.run('window.storesPrintPublisher.publish(' + JSON.stringify(template) + ')');
  const rejection = assert.rejects(publishing);
  await enteredUpload.promise; h.run('disconnectPublisher()'); waiting.resolve(response({content: {sha: 'late-template'}})); await rejection;
  assert.equal(h.calls.some(call => call.method === 'PUT' && call.endpoint === 'contents/print-templates.json'), false);
});

test('revoked write access is detected again before any artwork or config upload and repair preserves the draft', async () => {
  const h = harness(); await h.connect(); h.edit(); const before = h.snapshot();
  h.controls.probeError = denied(); await h.publish();
  assert.equal(h.calls.some(call => call.method === 'PUT'), false);
  assert.equal(h.$('publish').disabled, true);
  assert.equal(h.$('authRepair').hidden, false);
  assert.equal(h.saved.size, 0);
  assert.deepEqual(h.snapshot().state, before.state);
  assert.equal(h.$('title').value, 'unsaved form text');
  h.controls.probeError = null; await h.connect('synthetic-replacement-token');
  assert.equal(h.$('authRepair').hidden, true);
  await h.publish();
  assert.equal(h.remote.state.revision, 8);
  assert.equal(h.calls.filter(c => c.method === 'PUT' && c.endpoint === 'contents/config.json').length, 1);
});

test('publish rechecks the current source before artwork upload and stops a stale draft', async () => {
  const h = harness(); await h.connect(); h.edit();
  h.remote.sha = 'newer-live-file';
  await h.publish();
  assert.equal(h.calls.some(call => call.method === 'PUT'), false);
  assert.equal(h.$('publish').disabled, true);
  assert.equal(h.$('reloadPublished').hidden, false);
  assert.equal(h.$('title').value, 'unsaved form text');
});
