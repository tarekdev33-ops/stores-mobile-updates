# Stores 0.8.7 build 84

Removes Open dashboard editor from the phone's print settings and removes the crash-report button and viewer from About. Native crash diagnostics remain available internally; background host and terminal services are unchanged.

Redesigns the shared account-statement screen used by both ordinary and detailed statements: clear account-and-period heading, prominent account selector, consistent date cards, separated expandable options and a clear empty-state card. Search, account restrictions, dates, balances, detail rows, reconciliation scope and exports retain their existing behavior.

Validation: ten statement/export/printing UI tests, four current-release-notice tests (including exclusion of old highlights), small-phone render checks for both statement modes, clean static analysis, release signature/version and raw-download verification. No physical phone was attached.

This build is limited to the UI requests following build 83. The previously outstanding accounting base-currency migration is not included; the ledger engine continues using its existing USD base.

The in-app What’s New lists only build 84 UI changes, dated 10/11/2026.
