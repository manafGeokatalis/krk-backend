const db = require("../models");
const { Op, fn, col } = require('sequelize');

class StatistikService {
    async getPermohonanProgressCounts() {
        const result = await db.sequelize.query(` SELECT 
            SUM(CASE WHEN max_step < 5 THEN 1 ELSE 0 END) AS process,
            SUM(CASE WHEN max_step >= 5 THEN 1 ELSE 0 END) AS done
        FROM (
            SELECT 
                p.permohonan_id,
                MAX(step) AS max_step
            FROM 
                pkkpr.permohonan_progresses p  
            GROUP BY 
                p.permohonan_id
        ) AS subquery;`, {
            type: db.Sequelize.QueryTypes.SELECT
        })

        return result.length ? result[0] : null;
    }

    async getTotalFeedbackCount() {
        try {
            const count = await db.feedbacks.count();
            return count;
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async getListStatistik(year) {
        try {
            const result = await db.sequelize.query(`SELECT 
                COALESCE(MONTH(created_at), n.month) AS month,
                COALESCE(SUM(CASE WHEN step = 1 THEN 1 ELSE 0 END), 0) AS pengajuan_masuk,
                COALESCE(SUM(CASE WHEN step = 5 THEN 1 ELSE 0 END), 0) AS pengajuan_selesai
            FROM (
                SELECT 0 AS month UNION ALL
                SELECT 1 UNION ALL
                SELECT 2 UNION ALL
                SELECT 3 UNION ALL
                SELECT 4 UNION ALL
                SELECT 5 UNION ALL
                SELECT 6 UNION ALL
                SELECT 7 UNION ALL
                SELECT 8 UNION ALL
                SELECT 9 UNION ALL
                SELECT 10 UNION ALL
                SELECT 11
            ) AS n
            LEFT JOIN pkkpr.permohonan_progresses p ON MONTH(p.created_at) = n.month AND YEAR(p.created_at) = ${year}
            GROUP BY n.month
            ORDER BY n.month;`, {
                type: db.Sequelize.QueryTypes.SELECT
            })
            return result;
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }

    async getListFeedback(page, perPage, order, orderBy) {
        try {
            const offset = (page - 1) * perPage;
            const data = await db.feedbacks.findAll({
                attributes: [
                    'id',
                    'feedback',
                    'user_id',
                    'rating',
                    'created_at',
                ],
                limit: perPage,
                offset: offset,
                order: [[orderBy, order]],
                include: [
                    {
                        model: db.user,
                        as: 'user',
                        attributes: [
                            'id',
                            'email',
                            'name'
                        ]
                    }
                ]
            });

            return data
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async getCountVisitThisMonth() {
        try {
            const query = `SELECT COUNT(*) AS total_this_month
                            FROM pkkpr.visits p
                            WHERE MONTH(p.createdAt) = MONTH(CURRENT_DATE())
                            AND YEAR(p.createdAt) = YEAR(CURRENT_DATE())`

            const [result] = await db.sequelize.query(query, {
                type: db.Sequelize.QueryTypes.SELECT
            })

            return result.total_this_month


        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
    }

    async getVisitorPerMonth(year) {
        try {
            const result = await db.sequelize.query(`SELECT 
    COALESCE(MONTH(createdAt)-1, n.month) AS month,
    COALESCE(COUNT(v.id), 0) AS total_visitors
FROM (
    SELECT 0 AS month UNION ALL
    SELECT 1 UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6 UNION ALL
    SELECT 7 UNION ALL
    SELECT 8 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10 UNION ALL
    SELECT 11
) n
LEFT JOIN pkkpr.visits v
    ON (MONTH(v.createdAt) - 1) = n.month
   AND YEAR(v.createdAt) = ${year}
GROUP BY n.month
ORDER BY n.month`, {
                type: db.Sequelize.QueryTypes.SELECT
            })
            console.log(result)
            return result;
        } catch (error) {
            console.log(error)
            alert(error)
        }
    }

    async getNewUser(year) {
        try {
            const result = await db.sequelize.query(`SELECT 
    COALESCE(MONTH(created_at)-1, n.month) AS month,
    COALESCE(COUNT(u.id), 0) AS total_user
FROM (
    SELECT 0 AS month UNION ALL
    SELECT 1 UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6 UNION ALL
    SELECT 7 UNION ALL
    SELECT 8 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10 UNION ALL
    SELECT 11
) n
LEFT JOIN pkkpr.users u
    ON (MONTH(u.created_at) - 1) = n.month
   AND YEAR(u.created_at) = ${year} AND role="PUBLIC"
GROUP BY n.month
ORDER BY n.month`, {
                type: db.Sequelize.QueryTypes.SELECT
            })
            console.log(result)
            return result;
        } catch (error) {
            console.log(error)
            alert(error)
        }
    }

    async getAvgFeedback(year) {
        try {
            const result = await db.sequelize.query(`SELECT 
    COALESCE(MONTH(f.created_at)-1, n.month) AS month,
    COALESCE(ROUND(AVG(f.rating),1), 0) AS average_feedback
FROM (
    SELECT 0 AS month UNION ALL
    SELECT 1 UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6 UNION ALL
    SELECT 7 UNION ALL
    SELECT 8 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10 UNION ALL
    SELECT 11
) n
LEFT JOIN pkkpr.feedbacks f
    ON (MONTH(f.created_at) - 1) = n.month
   AND YEAR(f.created_at) = ${year} 
GROUP BY n.month
ORDER BY n.month`, {
                type: db.Sequelize.QueryTypes.SELECT
            })
            console.log(result)
            return result;
        } catch (error) {
            console.log(error)
            alert(error)
        }
    }
}

module.exports = new StatistikService;