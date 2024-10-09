const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 5000; // Port sur lequel le serveur sera disponible

app.use(express.json()); // Pour parser les corps de requêtes JSON
app.use(cors()); // Pour permettre les requêtes cross-origin

// Connexion à MongoDB
const mongoURI = 'mongodb+srv://tdm:mdpmongo@myproject.bnuwbq8.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=myProject';
mongoose.connect(mongoURI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Définir un modèle Mongoose
const itemSchema = new mongoose.Schema({
  nom: String,
  age: String,
  sexe: String,
});
const Item = mongoose.model('Item', itemSchema);

// Routes API
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/items', async (req, res) => {
  const item = new Item(req.body);
  try {
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
