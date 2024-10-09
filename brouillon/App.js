import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ nom: '', sexe: '' ,age :''});

  useEffect(() => {
    // Récupérer les items depuis le backend
    axios.get('http://localhost:5000/items')
      .then(response => setItems(response.data))
      .catch(error => console.error('Erreur lors de la récupération des items:', error));
  }, []);

  const handleAddItem = () => {
    if(newItem.nom!=''&&newItem.sexe!=''&&newItem.age!=''){
      axios.post('http://localhost:5000/items', newItem)
      .then(response => {
        setItems([...items, response.data]);
        setNewItem({ nom: '', sexe: '', age: ''});
      })
      .catch(error => console.error('Erreur lors de l’ajout de l’item:', error));
    }
  };

  return (
    <div>
      <h1>Liste des Items</h1>
      <ul>
        {items.map(item => (
          <li key={item._id}>{item.nom} ({item.age}) - {item.sexe}</li>
        ))}
      </ul>
      <h2>Ajouter un Item</h2>
      <input
        type="text"
        placeholder="Nom"
        value={newItem.nom}
        onChange={e => setNewItem({ ...newItem, nom: e.target.value })}
      />
      <input
        type="text"
        placeholder="Sexe"
        value={newItem.sexe}
        onChange={e => setNewItem({ ...newItem, sexe: e.target.value })}
      />
      <input
        type="text"
        placeholder="Age"
        value={newItem.age}
        onChange={e => setNewItem({ ...newItem, age: e.target.value })}
      />
      <button onClick={handleAddItem}>Ajouter</button>
    </div>
  );
};

export default App;