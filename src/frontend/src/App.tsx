import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Item {
  name: string;
  description?: string;
}

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/items/')
      .then(response => {
        setItems(response.data);
      })
      .catch(error => {
        console.error("Error fetching items", error);
      });
  }, []);

  return (
    <div>
      <h1>Items List</h1>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item.name}: {item.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
