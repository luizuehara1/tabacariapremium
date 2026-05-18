# Security Specification - Vapor Street

## 1. Data Invariants
- A product must have a name, price, and image.
- An order must have a customer name, address, items, and total.
- Order status starts as 'Pendente'.
- Only admins can manage products.
- Users can view their own orders (if auth'd) or admins can view all.

## 2. The "Dirty Dozen" Payloads
1. Create a product as a non-admin.
2. Update a product's price as a non-admin.
3. Delete a product as a non-admin.
4. Create an order with a fake `total` (e.g., negative).
5. Update an order's status to 'Entregue' as a customer.
6. Create an order and set own `uid` to another user's `uid`.
7. List all orders as a standard user.
8. Injection: Create a product with a 1MB name string.
9. Injection: Create a document in a collection not in the blueprint.
10. Update an order but change the `createdAt` timestamp.
11. Spoofing: Set `role` to 'admin' in a user document (if it existed).
12. Accessing PII (address) of other users' orders.

## 3. Red Team Evaluation (Summary)
- **Identity Spoofing**: Rejected by `request.auth.uid` checks or strict field validation.
- **State Shortcutting**: `affectedKeys().hasOnly()` during updates blocks unauthorized field changes.
- **Resource Poisoning**: `.size() <= MAX` on all strings.
- **Value Poisoning**: `isValid[Entity]()` checks types and ranges.
