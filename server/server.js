/*cd ~/Desktop/WEB/server
node server.js*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
const mongoURI = 'mongodb+srv://tdm:mdpmongo@myproject.bnuwbq8.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=myProject';
mongoose.connect(mongoURI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Définir un modèle Mongoose pour les utilisateurs
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    currentToken: String,
});
const User = mongoose.model('User', userSchema);

// Définir un modèle Mongoose pour les items
const itemSchema = new mongoose.Schema({
    email: String,
    name: String,
    quantity: Number,
});
const Item = mongoose.model('Item', itemSchema);

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log("Token reçu:", token);

    if (!token) {
        console.log("Pas de token fourni.");
        return res.sendStatus(401);
    }

    jwt.verify(token, 'votre_secret', async (err, user) => {
        if (err) {
            console.log("Erreur de vérification du token:", err);
            return res.sendStatus(403);
        }

        // Vérifier si le token actuel correspond à celui stocké pour l'utilisateur
        const storedUser = await User.findOne({ email: user.email });
        if (!storedUser || storedUser.currentToken !== token) {
            console.log("Token non valide ou expiré pour cet utilisateur.");
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });
};

// Route d'inscription
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    res.sendStatus(201);
});

// Route de connexion
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
        return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }

    // Générer un nouveau token et le stocker dans la base de données
    const token = jwt.sign({ email: user.email }, 'votre_secret', { expiresIn: '1h' });
    user.currentToken = token;
    await user.save();

    res.json({ token });
});

// Route pour déconnexion
app.post('/auth/logout', authenticateToken, async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    if (user) {
        user.currentToken = null; // Invalider le token en le supprimant de la base de données
        await user.save();
    }
    res.sendStatus(200);
});

// Route pour récupérer les items
app.get('/items', authenticateToken, async (req, res) => {
    const items = await Item.find({ email: req.user.email });
    res.json(items);
});

// Route pour créer un nouvel item
app.post('/items', authenticateToken, async (req, res) => {
    const { name, quantity } = req.body;
    const item = new Item({ email: req.user.email, name, quantity });
    await item.save();
    res.status(201).json(item);
});

// Route pour mettre à jour un item
app.put('/items/:id', authenticateToken, async (req, res) => {
    const { name, quantity } = req.body;
    const item = await Item.findByIdAndUpdate(req.params.id, { name, quantity }, { new: true });
    res.json(item);
});

// Route pour supprimer un item
app.delete('/items/:id', authenticateToken, async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
