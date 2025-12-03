-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - CASHIER SEED USER
-- ============================================================================
-- Migration: 012_seed_cashier_user.sql
-- Description: Seed a default cashier employee credential for initial access
-- Date: 2025-11-21
-- ============================================================================

BEGIN;

INSERT INTO employees (username, password_hash, name, email, status, role)
VALUES (
    'cashier',
    '$2b$10$XoX7c4orOrloavYk8xryc.M9FNb4tBWVEjgbLDOy2lt4clEqDUgl6',
    'Default Cashier',
    'cashier@smpi.com',
    'active',
    'cashier'
)
ON CONFLICT (username) DO NOTHING;

COMMIT;
