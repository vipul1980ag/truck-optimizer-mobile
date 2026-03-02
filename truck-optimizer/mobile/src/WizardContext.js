import React, { createContext, useContext, useState } from 'react';

const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const [items,          setItems]  = useState([]);
  const [shippingOption, setOption] = useState(null); // 'shared' | 'private'

  function addItem(item) {
    setItems(prev => [...prev, { ...item, _id: Date.now() + Math.random() }]);
  }
  function updateItem(_id, changes) {
    setItems(prev => prev.map(i => i._id === _id ? { ...i, ...changes } : i));
  }
  function removeItem(_id) {
    setItems(prev => prev.filter(i => i._id !== _id));
  }
  function resetWizard() {
    setItems([]);
    setOption(null);
  }

  return (
    <WizardContext.Provider value={{
      items, addItem, updateItem, removeItem,
      shippingOption, setShippingOption: setOption,
      resetWizard,
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export const useWizard = () => useContext(WizardContext);
