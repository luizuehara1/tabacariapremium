# Security Specification - Vapor Premium

## 1. Data Invariants
- Products can only be created/updated/deleted by Admins.
- Orders can be created by anyone (public), but must have a valid structure.
- Orders once created are immutable for the client (except maybe status by admin).
- Admin status is verified by lookup in the `admins` collection.

## 2. The Dirty Dozen Payloads (Targeting Rejection)
1. Creating a product as a non-admin.
2. Updating product price to 0 or negative.
3. Injecting a massive string as a product description.
4. Deleting a product as a non-admin.
5. Creating an order without a customer address.
6. Creating an order with a mismatched shipping price (must be 10).
7. Updating an existing order's address after creation (non-admin).
8. Listing all orders as a non-admin.
9. Attempting to make oneself an admin in the `admins` collection.
10. Creating a product with a non-string image URL.
11. Order items being a non-array.
12. Order status being "Delivered" immediately on creation.

## 3. Rules Implementation Strategy
- `isValidProduct()` helper for schema validation.
- `isValidOrder()` helper for schema validation.
- `isAdmin()` helper that checks `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.
- Global default deny.
