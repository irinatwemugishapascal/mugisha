# SIMS MySQL ERD

```mermaid
erDiagram
  USERS {
    int id PK
    varchar username UK
    varchar password_hash
    timestamp created_at
    timestamp updated_at
  }

  SPARE_PARTS {
    int id PK
    varchar name
    varchar category
    int quantity
    decimal unit_price
    decimal total_price
    timestamp created_at
    timestamp updated_at
  }

  STOCK_INS {
    int id PK
    int spare_part_id FK
    int stock_in_quantity
    datetime stock_in_date
    timestamp created_at
    timestamp updated_at
  }

  STOCK_OUTS {
    int id PK
    int spare_part_id FK
    int stock_out_quantity
    decimal stock_out_unit_price
    decimal stock_out_total_price
    datetime stock_out_date
    timestamp created_at
    timestamp updated_at
  }

  SESSIONS {
    varchar session_id PK
    bigint expires
    mediumtext data
  }

  SPARE_PARTS ||--o{ STOCK_INS : receives
  SPARE_PARTS ||--o{ STOCK_OUTS : issues
```

## Relationship Summary

- One `spare_parts` record can have many `stock_ins` records.
- One `spare_parts` record can have many `stock_outs` records.
- `users` stores login accounts.
- `sessions` stores Express session data for logged-in users.
- `spare_parts.name` and `spare_parts.category` are unique together to prevent duplicate spare-part entries.
