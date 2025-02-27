import React, { useState, useRef, useEffect } from 'react';
    import { doc, deleteDoc, updateDoc } from "firebase/firestore";
    import { db } from '../firebase';

    function ItemManagement({ items, regions, onAddItem, onUpdateItem, onDeleteItem }) {
      const [selectedRegion, setSelectedRegion] = useState('');
      const [name, setName] = useState('');
      const [price, setPrice] = useState('');
      const [schutzart, setSchutzart] = useState('');
      const [bws, setBws] = useState('');
      const [typ, setTyp] = useState('');
      const [art, setArt] = useState('');
      const [serie, setSerie] = useState('');
      const [material, setMaterial] = useState('');
      const [editingItemId, setEditingItemId] = useState(null);
      const [copyToRegion, setCopyToRegion] = useState('');
      const [searchItem, setSearchItem] = useState('');
      const formRef = useRef(null);
      const [sortedItems, setSortedItems] = useState([]);

      useEffect(() => {
        if (selectedRegion) {
          const filtered = items.filter(item => item.regions && item.regions.includes(selectedRegion) && item.name.toLowerCase().includes(searchItem.toLowerCase()));
          const sorted = [...filtered].sort((a, b) => {
            const aPrefix = a.name.substring(0, 3).toUpperCase();
            const bPrefix = b.name.substring(0, 3).toUpperCase();
            return aPrefix.localeCompare(bPrefix);
          });
          setSortedItems(sorted);
        } else {
          setSortedItems([]);
        }
      }, [items, selectedRegion, searchItem]);

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedRegion) {
          alert('Bitte wähle zuerst ein Gebiet aus.');
          return;
        }
        const newItem = {
          name,
          price,
          regions: [selectedRegion],
          schutzart,
          bws,
          typ,
          art,
          serie,
          material,
          order: items.length + 1, // Set initial order
        };

        if (editingItemId) {
          onUpdateItem({ id: editingItemId, ...newItem });
        } else {
          onAddItem(newItem);
        }

        setName('');
        setPrice('');
        setSchutzart('');
        setBws('');
        setTyp('');
        setArt('');
        setSerie('');
        setMaterial('');
        setEditingItemId(null);
      };

      const handleEditItem = (item) => {
        setEditingItemId(item.id);
        setName(item.name);
        setPrice(item.price);
        setSchutzart(item.schutzart);
        setBws(item.bws);
        setTyp(item.typ);
        setArt(item.art);
        setSerie(item.serie);
        setMaterial(item.material);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      };

      const handleDeleteItem = async (itemId) => {
        if (window.confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
          onDeleteItem(itemId);
        }
      };

      const handleDeleteAllItems = () => {
        if (window.confirm(`Möchten Sie wirklich alle Artikel für das Gebiet ${regions.find(r => r.id === selectedRegion)?.name} löschen?`)) {
          const allItemsInSelectedRegion = items.filter(item => item.regions && item.regions.includes(selectedRegion));
          allItemsInSelectedRegion.forEach(item => onDeleteItem(item.id));
        }
      };

      const handleCopyToRegion = () => {
        if (!copyToRegion) {
          alert('Bitte wählen Sie ein Zielgebiet aus.');
          return;
        }

        if (window.confirm(`Möchten Sie wirklich alle Artikel von ${regions.find(r => r.id === selectedRegion)?.name} nach ${regions.find(r => r.id === copyToRegion)?.name} kopieren?`)) {
          const allItemsInSelectedRegion = items.filter(item => item.regions && item.regions.includes(selectedRegion));
          allItemsInSelectedRegion.forEach(item => {
            const newItem = {
              name: item.name,
              price: item.price,
              regions: [copyToRegion],
              schutzart: item.schutzart,
              bws,
              typ,
              art,
              serie,
              material,
              order: items.length + 1, // Set initial order
            };
            onAddItem(newItem);
          });
          setCopyToRegion('');
        }
      };

      const moveItemUp = async (item) => {
        const currentIndex = sortedItems.findIndex(i => i.id === item.id);
        if (currentIndex > 0) {
          const otherItem = sortedItems[currentIndex - 1];
          await swapOrder(item, otherItem);
        }
      };

      const moveItemDown = async (item) => {
        const currentIndex = sortedItems.findIndex(i => i.id === item.id);
        if (currentIndex < sortedItems.length - 1) {
          const otherItem = sortedItems[currentIndex + 1];
          await swapOrder(item, otherItem);
        }
      };

      const swapOrder = async (item1, item2) => {
        const item1Ref = doc(db, 'items', item1.id);
        const item2Ref = doc(db, 'items', item2.id);

        // Optimistic update
        onUpdateItem({ ...item1, order: item2.order });
        onUpdateItem({ ...item2, order: item1.order });

        try {
          await updateDoc(item1Ref, { order: item2.order });
          await updateDoc(item2Ref, { order: item1.order });
        } catch (error) {
          console.error("Error updating item order", error);
          alert("Error updating item order");
        }
      };

      return (
        <div>
          <h2>Artikel erstellen</h2>
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
            <option value="">Gebiet auswählen</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>

          {selectedRegion && (
            <div>
              <form onSubmit={handleSubmit} ref={formRef}>
                <input
                  type="text"
                  placeholder="Artikel Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Preis"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />

                <select value={schutzart} onChange={(e) => setSchutzart(e.target.value)}>
                  <option value="">Schutzart</option>
                  <option value="IP Hoch">IP Hoch</option>
                  <option value="IP Niedrig">IP Niedrig</option>
                </select>

                <select value={bws} onChange={(e) => setBws(e.target.value)}>
                  <option value="">BWS</option>
                  <option value="BWS Ja">BWS Ja</option>
                  <option value="BWS Nein">BWS Nein</option>
                </select>

                <select value={typ} onChange={(e) => setTyp(e.target.value)}>
                  <option value="">Typ</option>
                  <option value="RZ">RZ</option>
                  <option value="SL">SL</option>
                  <option value="Modul">Modul</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>

                <select value={art} onChange={(e) => setArt(e.target.value)}>
                  <option value="">Art</option>
                  <option value="EZB">EZB</option>
                  <option value="EVG">EVG</option>
                </select>

                <select value={serie} onChange={(e) => setSerie(e.target.value)}>
                  <option value="">Serie</option>
                  <option value="Display">Display</option>
                  <option value="Würfel">Würfel</option>
                  <option value="Kompakt">Kompakt</option>
                  <option value="Kombi">Kombi</option>
                  <option value="Spot">Spot</option>
                  <option value="Trapez">Trapez</option>
                  <option value="Fokus">Fokus</option>
                  <option value="SUB">SUB</option>
                  <option value="Sonder">Sonder</option>
                </select>

                <select value={material} onChange={(e) => setMaterial(e.target.value)}>
                  <option value="">Material</option>
                  <option value="Stahl">Stahl</option>
                  <option value="Alu">Alu</option>
                  <option value="PC">PC</option>
                  <option value="Edelstahl">Edelstahl</option>
                  <option value="Sonder">Sonder</option>
                </select>

                <button type="submit">{editingItemId ? 'Update Artikel' : 'Artikel hinzufügen'}</button>
              </form>
              <select value={copyToRegion} onChange={(e) => setCopyToRegion(e.target.value)}>
                <option value="">Zielgebiet auswählen</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
              <button onClick={handleCopyToRegion}>Artikel in Gebiet kopieren</button>

              <input
                type="text"
                placeholder="Artikel suchen..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
              />

              <ul>
                {sortedItems.map(item => (
                  <li key={item.id}>
                    {item.name} - {item.price}
                    <br />
                    Schutzart: {item.schutzart}, BWS: {item.bws}, Typ: {item.typ}, Art: {item.art}, Serie: {item.serie}, Material: {item.material}
                    <button onClick={() => moveItemUp(item)}>&#9650;</button>
                    <button onClick={() => moveItemDown(item)}>&#9660;</button>
                    <button onClick={() => handleEditItem(item)}>Bearbeiten</button>
                    <button className="delete-button" onClick={() => handleDeleteItem(item.id)}>Löschen</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    export default ItemManagement;
