const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req,res) => {
    try {
        const {rows} = await pool.query('SELECT id,libelle FROM categorie ORDER BY id')
        res.status(200).json(rows)
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Erreur serveur'})
    }
})

module.exports = router; 