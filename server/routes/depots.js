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

router.post ('/', async (req,res) => {
    try {
        const {personne_id, date_depot, type} = req.body;

        if (!personne_id || !date_depot || !type) {
                return res.status(400).json({error : 'Les champs perosnne_id, date_depot et type sont obligatoires'});
        }

        if (typeof personne_id !== 'number' || !Number.isInteger(personne_id)) {
            return res.status(400).json({error: 'personne_id doit être un nombre entier'});
        }

        if (isNaN(Date.parse(date_depot))) {
            return res.status(400).json({error: 'date_depot doit être une date au format valide (AAAA-MM-JJ)'});
        }

        const typesValides = ['boutiqe' , 'domicile'];

        if (!typesValides.includes(type)) {
            return res.status(400).json({error: `type doit être l'une des valeurs suivantes : ${typesValides.join(', ')}`});
        }

        const { rows } = await pool.query(
            'INSERT INTO depot (personne_id, date_depot, type) VALUES ($1, $2, $3::type_depot) RETURNING *' , [personne_id, date_depot, type]
        );

        res.status(201).json(rows[0])
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Erreur serveur'});
    }
});

router.post('/:id/objets' , async (req,res) => {
    try {
        const { id } = req.params; 

        const depotExiste = await pool.query('SELECT id FROM depot WHERE id = $1' , [id]);
        if (depotExiste.rows.length === 0) {
            return res.status(404).json({ error: 'Dépôt introuvable'});
        }
        
        const {libelle, poids_kg, etat_arrivee, categorie_id} = req.body
        if (!libelle || poids_kg === undefined || !etat_arrivee || !categorie_id) {
            return res.status(400).json({ error: 'Les champs libelle, poids_kg, etat_arrivee, categorie_id sont obligatoires'});
        }

        if (typeof libelle  !== 'string') {
            return res.status(400).json({ error : 'libelle doit être une chaîne de caractères'});
        }
        
        if (typeof poids_kg  !== 'number') {
            return res.status(400).json({ error : 'poids_kg doit être un un nombre'});
        }
        
        if (typeof categorie_id  !== 'number' || !Number.isInteger(categorie_id)) {
            return res.status(400).json({ error : 'categorie_id doit être un un nombre entier'});
        }

        const etatsValides = ['bon_etat', 'a_reparer', 'hors_service']

        if (!etatsValides.includes(etat_arrivee)) {
            return res.status(400).json({ error : `etat_arrivee doit être une de svaleurs suivantes ${etatsValides.join(', ')}`});
        }

        const { rows } = await pool.query(
            'INSERT INTO objet (libelle, poids_kg, etat_arrivee, categorie_id, depot_id) VALUES ($1 , $2, $3::etat_objet, $4, $5) RETURNING *' , [libelle, poids_kg, etat_arrivee, categorie_id, id]
        );

        res.status(201).json(rows[0]);


    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur'});
        
    }
}); 

module.exports = router;