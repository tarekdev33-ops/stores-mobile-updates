# Stores Mobile 0.8.7 — build 82

Adds pdfme-based visual print templates to the existing dashboard and offline JSON import/rendering to the Android app. Supports sale/purchase invoices and returns, POS sale documents, receipt/payment vouchers, A4 and 80 mm. Invoice/voucher PDF and Print use the template chooser; report PDF and Excel exports are preserved.

Phone: More → Print templates → import JSON or download a template from the dashboard's print catalog. Templates, embedded logos and Cairo are local; document values are never uploaded. Company profile, per-document/per-paper defaults, export and delete are available. Import is tested by the real renderer before replacing a saved template.

The source retains build 81 UI reauthentication, background LAN engine ownership, Firebase delivery and the hash-verified vendored SQLite package. Version 0.8.7+82, arm64 split APK code 2082; signing identity matches the preceding preview APK.

Validated: real browser designer/JSON export and publication bridge; offline browser renderer including an embedded logo and literal text; six document kinds at both sizes; 500-row paginated PDFs with totals at the end; Dart financial, template and UI-lock/export tests; native channel restrictions/cleanup and existing LAN lifecycle tests. Static analysis clean. Physical Android WebView, actual printer services/paper and iOS were not available for device testing.

See tool/print-designer/README.md for template contract, build instructions, limits and the owner workflow. Printing is Android system printing in this build; direct ESC/POS transport and an iOS pdfme host are not included. Keep exported JSON files separately from financial-only workspace backups.
