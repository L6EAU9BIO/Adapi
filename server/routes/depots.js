const express = require('express');
const router = express.Router();
const pool = require('../db.js');

router.get('/:id', async (req,res) => {
    try{
        
        const { id } = req.params

        const depotResult = await pool.query('SELECT d.id, d.date_depot, d.type, p.nom, p.prenom FROM depot d JOIN personne p ON p.id = d.personne_id WHERE d.id=$1' , [id]);
    

    if (depotResult.rows.length === 0) {
        return res.status(404).json({ error:'Dépot introuvable'})
    }

    const objetResult = await pool.query('SELECT o.id, o.libelle, O.statut, o.prix FROM objet o WHERE o.depot_id = $1 ORDER BY o.id' ,[id]);

    const depot = depotResult.rows[0];
    depot.objets = objetResult.rows;

    res.status(200).json(depot);
    
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur'});
    }

});

module.exports = router;