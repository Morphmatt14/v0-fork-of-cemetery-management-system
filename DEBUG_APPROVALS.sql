-- Run this in Supabase SQL Editor to check approval execution status

-- 1. Check approved actions and their execution status
SELECT 
    id,
    action_type,
    target_entity,
    target_id,
    status,
    is_executed,
    execution_error,
    change_data,
    requested_by_username,
    created_at
FROM pending_actions
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check if the payment updates actually happened
SELECT 
    p.id,
    p.payment_status,
    p.amount,
    c.name as client_name,
    p.payment_date,
    p.updated_at
FROM payments p
LEFT JOIN clients c ON c.id = p.client_id
WHERE p.client_id = '8e9a1c3c-e27e-426b-a9bd-b75efe4213b7'
ORDER BY p.created_at DESC;

-- 3. Check execution errors specifically
SELECT 
    id,
    action_type,
    target_id,
    change_data->>'status' as new_status,
    execution_error,
    is_executed,
    executed_at
FROM pending_actions
WHERE status = 'approved' 
AND is_executed = false
ORDER BY created_at DESC;
