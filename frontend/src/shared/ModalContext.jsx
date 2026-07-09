import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ModalStateContext = createContext(null);
const ModalActionsContext = createContext(null);

export function ModalProvider({ children }) {
  const [activeActionModal, setActiveActionModal] = useState(null);

  const openModal  = useCallback((type) => setActiveActionModal(type), []);
  const closeModal = useCallback(() => setActiveActionModal(null), []);

  const stateValue   = useMemo(() => ({ activeActionModal }), [activeActionModal]);
  const actionsValue = useMemo(() => ({ openModal, closeModal, setActiveActionModal }), [openModal, closeModal]);

  return (
    <ModalStateContext.Provider value={stateValue}>
      <ModalActionsContext.Provider value={actionsValue}>
        {children}
      </ModalActionsContext.Provider>
    </ModalStateContext.Provider>
  );
}

export function useModalState() {
  return useContext(ModalStateContext);
}

export function useModalActions() {
  return useContext(ModalActionsContext);
}
