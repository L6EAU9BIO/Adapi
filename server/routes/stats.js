const experess = require('express');
const router = experess.Router();
const pool = require ('../db.js');

router.get ('/' , async (req,res) => {
    try {
        const parStatutResult = await pool.query(
            'SELECT statut, COUNT(*) AS nombre FROM objet GROUP BY statut ORDER BY statut');

        const poidsResult = await pool.query(
            `SELECT SUM(poids_kg) AS poids_total, SUM(poids_kg) FILTER (WHERE statut = 'recycle') AS poids_recycle FROM objet`
        );

        const poidsTotal = Number(poidsResult.rows[0].poids_total)
        const poidsRecycle = Number(poidsResult.rows[0].poids_recycle) || 0;
        const poidsDetourne = Math.round((poidsTotal - poidsRecycle) * 100 )/ 100;

        res.status(200).json({
            objet_par_statut : parStatutResult.rows,
            poids_total_recu : poidsTotal,
            poids_detourne_dechetterie : poidsDetourne
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Erreur serveur"});   
    }
});

module.exports = router;