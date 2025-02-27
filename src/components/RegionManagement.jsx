import React, { useState } from 'react';
import { doc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase';

function RegionManagement({ regions, onAddRegion, onUpdateRegion, onDeleteRegion, items, onUpdateItem }) {
  const [name, setName] = useState('');
  const [editingRegionId, setEditingRegionId] = useState(null);
  const [priceAdjustments, setPriceAdjustments] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRegionId) {
      onUpdateRegion({ id: editingRegionId, name });
      setEditingRegionId(null);
    } else {
      onAddRegion({ name });
    }
    setName('');
  };

  const handleEditRegion = (region) => {
    setEditingRegionId(region.id);
    setName(region.name);
  };

  const handleDeleteRegion = async (regionId) => {
    if (window.confirm('Möchten Sie dieses Gebiet wirklich löschen?')) {
      onDeleteRegion(regionId);
    }
  };

  const handlePriceAdjustmentChange = (regionId, value) => {
    setPriceAdjustments(prevAdjustments => ({
      ...prevAdjustments,
      [regionId]: value,
    }));
  };

  const handlePriceAdjustment = (regionId) => {
    const adjustment = priceAdjustments[regionId];

    if (!adjustment) {
      alert('Bitte geben Sie eine Preisanpassung ein.');
      return;
    }

    const region = regions.find(r => r.id === regionId);
    if (!region) {
      alert('Gebiet nicht gefunden.');
      return;
    }

    if (window.confirm(`Möchten Sie wirklich die Preise aller Artikel im Gebiet ${region.name} anpassen?`)) {
      const adjustmentValue = parseFloat(adjustment);
      const itemsToUpdate = items.filter(item => item.regions && item.regions.includes(regionId));

      itemsToUpdate.forEach(item => {
        const updatedPrice = parseFloat(item.price) + adjustmentValue;
        onUpdateItem({ ...item, price: updatedPrice.toFixed(2) });
      });

      setPriceAdjustments(prevAdjustments => ({ ...prevAdjustments, [regionId]: '' }));
    }
  };

  return (
    <div>
      <h2>Gebiete verwalten</h2>
      <form onSubmit={handleSubmit} className="region-form">
        <input
          type="text"
          placeholder="Neues Gebiet hinzufügen"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">{editingRegionId ? 'Gebiet aktualisieren' : 'Gebiet hinzufügen'}</button>
      </form>

      <ul className="region-list">
        {regions.map(region => (
          <li key={region.id} className="region-item">
            <div className="region-header">
              <span>{region.name}</span>
              <div>
                <button onClick={() => handleEditRegion(region)}>Bearbeiten</button>
                <button className="delete-button" onClick={() => handleDeleteRegion(region.id)}>Löschen</button>
              </div>
            </div>
            <div className="price-adjustment">
              <input
                type="number"
                placeholder="Preisanpassung"
                value={priceAdjustments[region.id] || ''}
                onChange={(e) => handlePriceAdjustmentChange(region.id, e.target.value)}
              />
              <button onClick={() => handlePriceAdjustment(region.id)}>Preise anpassen</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RegionManagement;
