# Firestore Security Specification

## 1. Data Invariants
- Each document in `transactions`, `budgets`, `bill_reminders`, and `notifications` strictly belongs to an authenticated user (`userId == request.auth.uid`).
- Unauthenticated users cannot read, list, create, or modify any financial data.
- Users cannot read or tamper with another user's transactions, budgets, reminders, or notifications.
- Transactions require valid numeric amounts (> 0), valid date format (`YYYY-MM-DD`), and known type (`income` | `expense`).
- Document IDs must conform to safe regex format `^[a-zA-Z0-9_\-]+$`.
- Immutability of ownership: `userId` cannot be updated or spoofed to another user ID.

## 2. Dirty Dozen Payloads Handled
1. **Unauthenticated Read/Write**: Attempting to query `transactions` without auth token -> Denied by `isSignedIn()` check.
2. **Cross-User Snooping**: User B querying `transactions` where `userId == User A` -> Denied by `resource.data.userId == request.auth.uid`.
3. **Identity Spoofing on Create**: User B creating document with `userId: "UserA"` -> Denied by `request.resource.data.userId == request.auth.uid`.
4. **Ownership Hijack on Update**: Attempting to alter `userId` on existing transaction -> Denied by `request.resource.data.userId == request.auth.uid`.
5. **ID Poisoning Attack**: Submitting 2MB or path traversal document ID -> Denied by `isValidId(docId)`.
6. **Shadow Field Injection**: Inserting unauthorized properties like `{ role: 'admin' }` -> Denied by `keys().hasOnly(...)`.
7. **Negative / NaN Amount**: Inserting negative expense or `amount: -5000` -> Denied by `amount > 0`.
8. **Invalid Transaction Type**: Inserting `type: 'investment'` -> Denied by `data.type in ['income', 'expense']`.
9. **Malformed Date Injection**: Inserting `date: "not-a-date"` or SQL/NoSQL payload -> Denied by regex `^\d{4}-\d{2}-\d{2}$`.
10. **Budget Alert Threshold Tampering**: Setting `alertThreshold: 99999` -> Denied by boundary check `<= 100`.
11. **Excessive String Length (Wallet Denial)**: Sending 10MB note field -> Denied by `note.size() <= 300`.
12. **Blind List Scraping**: Attempting collection-wide scan without userId filter -> Denied by `resource.data.userId == request.auth.uid` enforcement on list rules.
