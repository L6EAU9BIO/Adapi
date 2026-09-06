const express = require('express');
const router = express.Router();
const pool = require('../db.js');

router.post('/', async (req,res) => {
    try {
        const {nom , prenom, telephone, adherente} = req.body;

        if (!nom || !prenom) {
            return res.status(400).json({error: 'Les champs nom et prenom sont obligatoires'});
        }
        
        if (typeof nom !== 'string' || typeof prenom !== 'string') {
            return res.status(400).json({error: 'nom et prenom doivent être des chaînes de caractères'});
        }

        const { rows } = await pool.query ('INSERT INTO personne (nom, prenom, telephone, adherente) VALUES ($1, $2, $3, $4) RETURNING *' , [nom, prenom, telephone || null, adherente ?? false]);
        
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur'});
        
    }
});

module.exports = router;

