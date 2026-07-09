import { useState } from 'react';
import { adicionarValor, removerValor, definirMeta, deletarTransacao } from '../api';

export const MAX_VISIBLE = 200;

export function useFinanceLogic({ reload, notify }) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState(null);

  const handleAction = async (actionFn, value, razao = '') => {
    const v = parseFloat(value);
    if (!v || v <= 0) return notify('Insira um valor válido maior que zero.', 'error');

    setLoadingAction(true);
    try {
      await actionFn(v, razao);
      setActiveActionModal(null);
      await reload();
      notify('Operação realizada com sucesso!', 'success');
    } catch {
      notify('Erro ao realizar operação.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteTx = async (tx) => {
    setLoadingAction(true);
    try {
      await deletarTransacao({ data: tx.data, acao: tx.acao, quantidade: tx.quantidade, razao: tx.razao || '' });
      await reload();
      notify('Transação deletada com sucesso.', 'success');
    } catch {
      notify('Erro ao excluir transação.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  return {
    loadingAction,
    activeActionModal, setActiveActionModal,
    handleAction,
    handleDeleteTx,
    adicionarValor,
    removerValor,
    definirMeta,
  };
}
