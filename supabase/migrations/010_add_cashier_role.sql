-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - CASHIER ROLE SUPPORT
-- ============================================================================
-- Migration: 010_add_cashier_role.sql
-- Description: Introduce employee role column and extend notifications targets
-- Date: 2025-11-21
-- ============================================================================

BEGIN;

-- Add role column to employees table
ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'staff';

-- Ensure role column only accepts supported values
ALTER TABLE employees
    DROP CONSTRAINT IF EXISTS employees_role_check;

ALTER TABLE employees
    ADD CONSTRAINT employees_role_check
    CHECK (role IN ('staff', 'supervisor', 'cashier'));

-- Backfill NULL roles if any slipped in before constraint
UPDATE employees
SET role = 'staff'
WHERE role IS NULL;

-- Allow notifications to target cashiers specifically
ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_recipient_type_check;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_recipient_type_check
    CHECK (recipient_type IN ('client', 'employee', 'cashier', 'admin'));

COMMIT;
