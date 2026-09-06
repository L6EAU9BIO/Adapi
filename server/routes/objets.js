const express = require('express');
const router = express.Router();
const pool = require('../db.js');


// Route d'accées aux objets et leurs caractéristiques, intègre aussi la possibilité d'integrer le statut et l'id de sa catégorie pour affiner la recherche
router.get('/', async(req,res) => {
    try {
        const statut = req.query.statut || null;
        const categorieId = req.query.categorie_id || null;

        const { rows } = await pool.query('SELECT o.id, o.libelle, o.statut, o.prix , c.libelle AS categorie FROM objet o JOIN categorie c ON c.id = O.categorie_id WHERE o.statut = COALESCE($1::statut_objet, o.statut) AND o.categorie_id = COALESCE($2::integer, O.categorie_id) ORDER BY o.id DESC' , [statut, categorieId]);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur'});
    }
});

// Route d'accés à un certain objet selon son id fourni en paramètre ':id'
router.get('/:id', async (req,res) => {
    try{
        const { id } = req.params;

        const { rows } = await pool.query('SELECT o.id, o.libelle, o.poids_kg, o.etat_arrivee, o.statut, o.prix, o.date_mise_rayon, c.libelle AS categorie, o.depot_id, p.nom, p.prenom FROM objet o JOIN categorie c ON c.id = o.categorie_id JOIN depot d ON d.id = o.depot_id JOIN personne p ON p.id = d.personne_id WHERE o.id= $1' , [id]);

        if (rows.length === 0) {
            // L'erreur est déclenché car l'id ne correspond à aucun objet présent dans la DB 
            return res.status(404).json({ error: 'Objet introuvable'});
        }

        res.status(200).json(rows[0]);
    
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.patch ('/:id/statut' , async (req,res) => {
    try {
        const { id } = req.params;
        const { statut, prix} = req.body;

        const objetExiste = await pool.query('SELECT id FROM objet WHERE id = $1' , [id]);
        if ( objetExiste.rows.length === 0 ) {
            return res.status(404).json({ error : "Objet introuvable"});
        }
        if (!statut) {
            return res.status(400).json({error : "Le champ statut est obligatoire"});
        }
        const statusValides = ['arrive' , 'en_reparation', 'en_rayon', 'recycle'];
        if (!statusValides.includes(statut)) {
            return res.status(400).json({error: `statut doit être une des valeurs suivantes ${statusValides.join(',')} `});
        }
        if (prix !== undefined && typeof prix !== 'number') {
            return res.status(400).json({error : 'prix doit être un nombre'})
        }

        const { rows } = await pool.query(
            'UPDATE objet SET statut =$1::statut_objet, prix = COALESCE($2, prix) WHERE id = $3 RETURNING *' , [statut, prix ?? null , id]
        );
        
        res.status(200).json(rows[0]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur"});
        
    }
});

module.exports = router;