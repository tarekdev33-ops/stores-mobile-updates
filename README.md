# داش بورد ستورز

Public announcements and scheduled, preloaded logo appearances only. This repository contains no app source, customer records, activation keys, accounting data, or publisher tokens.

The dashboard is `index.html`, hosted on GitHub Pages. The app reads `config.json` through HTTPS, caches the last validated feed, filters by device role and app version, and checks the schedule locally even offline. Publication increments the feed revision. Publish empty notices and a null appearance to withdraw all content. Use a new notice id to announce the same subject again after users dismissed the previous notice.

Open [داش بورد ستورز](https://tarekdev33-ops.github.io/stores-mobile-updates/?console=20261121-1). Choose the logo, the Stores lettering, or both and set each selected color independently. Publish uses the current appearance fields. Editing an expired appearance starts a new seven-day draft window, which you can change before publishing. New appearances and notices target all devices. Existing published notices retain their audience when edited.

The recommended setup uses a fine-grained GitHub token created by `tarekdev33-ops`, restricted to `stores-mobile-updates`, with Contents read/write permission. The creation link prefills the resource owner and Contents write permission; select this repository before generating the token. Fine-grained tokens from another account cannot publish here through repository collaborator access. The dashboard also accepts other tokens that GitHub authorizes for writing this repository; it does not restrict a legitimate classic-token collaborator by account name.

Connection checks Contents write permission by submitting the existing `config.json` tree entry unchanged and requiring GitHub to return the same tree SHA. This check creates no commit, does not update `main` and does not publish news. Only Publish changes the feed; reading the public feed alone does not prove write permission.

After a successful connection, the page stores the token in this browser’s localStorage and reconnects automatically on reopening. Authentication requests send it only to api.github.com; it is never included in campaign JSON, template JSON, URLs or repository files. Disconnect removes the saved token and disconnects other open dashboard tabs. HTTP 401 or a token-permission HTTP 403 stops publishing, removes the rejected saved token and shows the replacement input. Temporary network, rate-limit, SSO and protected-branch errors keep the saved token. Storage blocked by the browser is reported, while the current session can still publish.

Replacing a rejected token preserves the current draft, selected images and form values. Reconnection keeps pending work when the published feed still matches its original SHA or content. If another session changed the feed, publishing stops without overwriting the draft: export it before loading the latest published version and reapplying the changes. GitHub access and repository rules remain the authority, and conflicting commits fail rather than overwrite another publisher’s edits.

GitHub Pages takes time to deploy a committed change. The app polls every two minutes while open and on resume; it is not a background push service. Offline devices see cached content until its own expiry. No announcements are pre-published by setup.

## Version 0.8.5 artwork and first installation

The console accepts JPEG, PNG and WebP, downsizes to 1400px, encodes WebP and limits uploads to 1.5 MB each. Images remain in the browser draft until Publish. Publish uploads only referenced artwork to `assets/campaigns/<uuid>.webp`, then updates config.json using its existing SHA. Unreferenced files are deliberately not deleted: older cached feeds may still reference them. An upload that succeeds before a config conflict can leave an unused public file. Export a conflicting draft before loading the latest feed; draft exports contain JSON references, so keep the selected image files for reapplying changes after a reload.

Notice `imageUrl`, appearance `iconImageUrl` and `nameImageUrl` must be HTTPS without credentials. `textColor` controls the Stores lettering separately from `color` for the icon. The two artwork images are alpha-masked into the existing icon and text, not used as replacement logos. These fields require Stores 0.8.5+. Existing campaign fields remain compatible. `motion:false` makes the header decoration static; device reduce-motion also disables motion. Decoration is clipped to the header, behind controls, and never blocks taps. Sensors stop when the app pauses or the header disappears. Hardware motion needs a sensor-capable device.

Fresh installations fetch immediately without relying on a stored revision or a push message. Requests bypass CDN/browser cache and fall back from raw.githubusercontent.com to the public GitHub Pages config. The last validated feed persists for offline use until expiry. News includes manual refresh, revision, and a connection-failure message. Scheduled content still respects its start/end, role and supported version. Images not downloaded before going offline fall back to ordinary text/brand colors; no accounting or login depends on them. Publishing this dashboard does not replace the installed APK: install 0.8.5 for the added artwork features.

## Publishing regression checks

From this console directory, run `node tests/console-auth.test.cjs` (Node.js 18+). The tests use synthetic credentials and mocked GitHub responses; they do not publish live news.

## Publisher repair — 2026.11.17.3

Open the current console at `https://tarekdev33-ops.github.io/stores-mobile-updates/?console=20261117-3`; an already-open old tab can still display the obsolete connected state. The visible console build identifies the loaded implementation. This is a web-console update and does not need a new mobile APK.

A connected state now proves Contents write by recreating the same tree without changing any commit or reference. Publishing repeats this check and compares the current config SHA before uploading any artwork. HTTP401 or credential-related403 clears the rejected credential, disables publishing and opens the repair guide, retaining drafts, images and current editor fields. A replacement token can continue the same draft when the live base is unchanged. GitHub account permissions must be granted in GitHub; the web console cannot elevate a rejected token.
