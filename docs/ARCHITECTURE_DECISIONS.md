# BusinessOS AI - Architecture Decisions

## Database

- PostgreSQL
- SQLAlchemy 2.0
- Alembic

## Primary Keys

- UUID for every table

## Base Model

Every model inherits:

- id (UUID)
- created_at
- updated_at
- deleted_at
- created_by
- updated_by

## Soft Delete

Enabled

Never permanently delete records.

## Multi-Tenant

Enabled

Every business entity contains

organization_id

## Authentication

JWT

Access Token

Refresh Token

## Password Hashing

bcrypt

## Relationships

Use SQLAlchemy relationships.

## Repository Pattern

Enabled

## Service Layer

Enabled

## Validation

Pydantic v2

## Dependency Injection

FastAPI Depends()

## API Style

REST

## Error Handling

Global Exception Handler

## Response Format

{
    "success": true,
    "message": "",
    "data": {},
    "errors": []
}

## Naming

snake_case

## Logging

Structured Logging

## Timezone

UTC

## IDs

UUID4