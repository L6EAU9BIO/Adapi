require('dotenv').config();

const express = require('express');
const categoriesRouter = require('./routes/categories');
const objetsRouter = require('./routes/objets');
const depotsRouter = require('./routes/depots');
const personnesRouter = require('./routes/personnes');
const statsRouter = require('./routes/stats')


const app = express();
app.use(express.json());

app.use('/api/categories', categoriesRouter);
app.use('/api/objets', objetsRouter);
app.use('/api/depots', depotsRouter);
app.use('/api/personnes', personnesRouter); 
app.use('/api/stats' , statsRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});