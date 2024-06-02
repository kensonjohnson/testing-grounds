-- This entire file is not used, but kept for reference
SELECT
    (
        SELECT
            sum(amount) AS balance
        FROM
            credit
        WHERE
            user_id = $1
            AND created_on > NOW() - INTERVAL '60' day);

SELECT
    SUM(credit.amount) - SUM(debit.amount) AS balance
FROM
    credit
    LEFT JOIN debit ON credit.user_id = debit.user_id
WHERE
    credit.user_id = 1
    AND credit.created_on > NOW() - INTERVAL '60' day
    AND debit.created_on > NOW() - INTERVAL '60' day;

SELECT
    (
        SELECT
            sum(amount)
        FROM
            credit
        WHERE
            user_id = 1
            AND created_on > NOW() - INTERVAL '60' day) -(
        SELECT
            sum(amount)
        FROM
            debit
        WHERE
            user_id = 1
            AND created_on > NOW() - INTERVAL '60' day) AS balance;

