import React, { useState, useEffect } from 'react';
import ItemSearch from './components/ItemSearch';
import ItemManagement from './components/ItemManagement';
import RegionManagement from './components/RegionManagement';
import LandingPage from './components/LandingPage';
import ApprovalManagement from './components/ApprovalManagement';
import { db, itemsCollection, regionsCollection, addDoc, setDoc, doc, deleteDoc, onSnapshot, collection, auth, onAuthStateChanged, signOut } from './firebase';
import { getDoc } from 'firebase/firestore';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [items, setItems] = useState([]);
  const [regions, setRegions] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminDocSnapshot = await getDoc(adminDocRef);

          if (adminDocSnapshot.exists() && adminDocSnapshot.data().isAdmin === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching admin status:", error);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let itemsUnsubscribe;
    let regionsUnsubscribe;

    if (user && isAdmin) {
      itemsUnsubscribe = onSnapshot(itemsCollection, (snapshot) => {
        const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(itemsData); // Show all items directly
        setDbError(null);
      }, (error) => {
        console.error("Error fetching items:", error);
        setDbError("Fehler beim Laden der Artikel aus der Datenbank.");
      });

      regionsUnsubscribe = onSnapshot(regionsCollection, (snapshot) => {
        const regionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRegions(regionsData);
        setDbError(null);
      }, (error) => {
        console.error("Error fetching regions:", error);
        setDbError("Fehler beim Laden der Gebiete aus der Datenbank.");
      });
    }

    return () => {
      if (itemsUnsubscribe) itemsUnsubscribe();
      if (regionsUnsubscribe) regionsUnsubscribe();
    };
  }, [user, isAdmin]);

  const handleAddItem = async (newItem) => {
    try {
      await addDoc(itemsCollection, { ...newItem, approved: true }); // Add directly to itemsCollection
      setDbError(null);
    } catch (error) {
      console.error("Error adding item", error);
      setDbError("Fehler beim Hinzufügen des Artikels zur Datenbank.");
    }
  };

  const handleUpdateItem = async (updatedItem) => {
    try {
      const itemDocRef = doc(db, 'items', updatedItem.id); // Update in itemsCollection
      await setDoc(itemDocRef, updatedItem);
      setDbError(null);
    } catch (error) {
      console.error("Error updating item", error);
      setDbError("Fehler beim Aktualisieren des Artikels in der Datenbank.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const itemDocRef = doc(db, 'items', itemId); // Delete from itemsCollection
      await deleteDoc(itemDocRef);
      setDbError(null);
    } catch (error) {
      console.error("Error deleting item", error);
      setDbError("Fehler beim Löschen des Artikels aus der Datenbank.");
    }
  };

  const handleAddRegion = async (newRegion) => {
    try {
      await addDoc(regionsCollection, newRegion); // Add region directly
      setDbError(null);
    } catch (error) {
      console.error("Error adding region", error);
      setDbError("Fehler beim Hinzufügen des Gebiets zur Datenbank.");
    }
  };

  const handleUpdateRegion = async (updatedRegion) => {
    try {
      const regionDocRef = doc(db, 'regions', updatedRegion.id);
      await setDoc(regionDocRef, updatedRegion);
      setDbError(null);
    } catch (error) {
      console.error("Error updating region", error);
      setDbError("Fehler beim Aktualisieren des Gebiets in der Datenbank.");
    }
  };

  const handleDeleteRegion = async (regionId) => {
    try {
      const regionDocRef = doc(db, 'regions', regionId);
      await deleteDoc(regionDocRef);
      setDbError(null);
    } catch (error) {
      console.error("Error deleting region", error);
      setDbError("Fehler beim Löschen des Gebiets aus der Datenbank.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <LandingPage onSignIn={() => {}} />;
  }

  if (!isAdmin) {
    return (
      <div className="container">
        <h2>Zugriff verweigert.</h2>
        <button onClick={handleSignOut}>Abmelden</button>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="nav">
        <button onClick={() => setActiveTab('search')} className={activeTab === 'search' ? 'active' : ''}>Suchen</button>
        <>
          <button onClick={() => setActiveTab('manageItems')} className={activeTab === 'manageItems' ? 'active' : ''}>Artikel erstellen</button>
          <button onClick={() => setActiveTab('manageRegions')} className={activeTab === 'manageRegions' ? 'active' : ''}>Gebiete verwalten</button>
        </>
        <button onClick={handleSignOut}>Abmelden</button>
      </nav>

      {dbError && <div className="error-message">{dbError}</div>}

      {activeTab === 'search' && <ItemSearch items={items} regions={regions} />}
      {activeTab === 'manageItems' && (
        <ItemManagement
          items={items}
          regions={regions}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      )}
      {activeTab === 'manageRegions' && (
        <RegionManagement
          regions={regions}
          onAddRegion={handleAddRegion}
          onUpdateRegion={handleUpdateRegion}
          onDeleteRegion={handleDeleteRegion}
          items={items}
          onUpdateItem={handleUpdateItem}
        />
      )}
    </div>
  );
}

export default App;
