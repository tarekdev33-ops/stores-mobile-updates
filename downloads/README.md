# Stores Mobile 0.8.7 — build 72

Bottom navigation icons now play a short 480ms scale, upward bounce and tilt when tapped. Repeating a tap on the currently selected destination replays the effect. The icon glyphs, colors, labels, navigation targets and permissions are unchanged. A shared animation controller updates only the icon transforms; the labels and touch targets do not move. The effect remains off at startup, ends at the original pose, stops on app pause, respects reduced-motion settings and is disposed with the home screen. The restricted one-destination More bar uses the same effect.

The What's New dialog retains all six 0.8.6 entries and prepends the navigation animation entry. Version 0.8.7 has its own once-per-version presentation; users who have already seen 0.8.6 see the new dialog once. Arabic, English, Turkish and Hindi descriptions are provided.

All 0.8.6 functionality remains included. Workspace schema 26 and SQLite schema 5 are unchanged. Android arm64 versionCode 2072; install over the existing app without clearing data.
