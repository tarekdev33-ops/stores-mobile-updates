# Stores Mobile 0.8.6 — build 71

- Device notifications when new unread Stores news reaches the app, with a persistent deduplication history and a notification tap that opens Stores news. Public news is fetched on opening/resuming and periodically while the app runs; publishing the GitHub feed does not itself send a background Firebase push.
- Four notification tabs: stock alerts, reminders (including terminal invoice notices), Stores news, and backup reminders. Activation fields disappear after notification permission is granted. The refresh button reschedules reminders, stock alerts and the backup reminder.
- Optional daily backup reminder with a selected time, persistent device settings, restore on restart and independent cancellation. The reminder does not create or upload a backup automatically. Exact scheduling is used when the OS permits it, otherwise approximate alarms apply.
- New short customer IDs under account 121 start at 1211 and advance after the largest existing short ID, without filling intermediate deleted gaps. Legacy padded IDs, names, balances and document references are preserved. Canonical short IDs may coexist with legacy padded IDs under 121; exact ID uniqueness remains enforced. Offline customer IDs retain the existing 18-digit uniqueness scheme, with the prefix 1211, and do not advance the online short counter.
- Currency exchange permits no party or a customer/supplier account. Detailed statement account selection is limited to customer/supplier accounts. Existing historical document references are not rewritten.
- Support is immediately before logout. Item entry reads «إضغط لإضافة صنف أو إدخال الباركود». Tax and invoice expenses share one row in invoice and POS screens; the common item-entry wording also applies to warehouse vouchers. Default item unit reads «قطعة».
- Workspace schema remains 26 and SQLite schema remains 5. Includes the prior branding cache and equal flag size corrections. Update the primary and terminals to use all changes consistently.

Android arm64 versionCode 2071; install over the existing app without clearing data.
