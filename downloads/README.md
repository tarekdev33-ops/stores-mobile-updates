# Stores 0.8.7 build 83

Changes shipped: compact dialog theme and primary titles; customer/account picker height follows results up to a bounded scroll area; Import template label; dashboard catalog button removed. Existing printing, authentication, background LAN and vendored SQLite remain.

Dashboard: DevExpress XML conversion with explicit header/column mapping, unsupported expression review, standard Stores financial footer, preview and native JSON export. Tested with the owner's supplied XML. Supports one details table and blank A4/80mm pages; nested reports, executable custom .NET controls and arbitrary calculations are not reproduced. Review the preview before printing.

SQL Server: schema matching the five SQLite storage tables with Unicode JSON payloads, Items/Accounts/Documents read views, and a read-only SQLite snapshot exporter. It does not contain records from an unattached phone and does not replace the app's SQLite engine. No SQL Server instance was available for executing the T-SQL here.

NOT completed in this build: changing the accounting base currency and repricing opening balances. The current engine's USD assumptions extend to opening money legs, stock valuation, document snapshots and reports. No unsafe global substitution or relabeling has been enabled. This requires a separate atomic migration and regression suite before release.

No physical printer/phone was attached. Browser converter/printing and Flutter tests provide automated coverage only.
