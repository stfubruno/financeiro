import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, CircularProgress, Divider
} from '@mui/material';
import {
  AddCircleOutline, RemoveCircleOutline, TrackChanges,
  AttachMoney, Close
} from '@mui/icons-material';
import { useModalState, useModalActions } from '../shared/ModalContext';

const dialogConfig = {
  add: {
    title: 'Nova Entrada',
    icon: <AddCircleOutline />,
    submitLabel: 'Adicionar',
    submitColor: 'success',
    showRazao: true,
  },
  remove: {
    title: 'Nova Saída',
    icon: <RemoveCircleOutline />,
    submitLabel: 'Remover',
    submitColor: 'error',
    showRazao: true,
  },
  meta: {
    title: 'Definir Meta',
    icon: <TrackChanges />,
    submitLabel: 'Salvar Meta',
    submitColor: 'info',
    showRazao: false,
  },
};

function CurrencyInput({ value, onChange, disabled, autoFocus }) {
  const format = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const num = (parseInt(digits, 10) / 100).toFixed(2);
    return num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    onChange(raw);
  };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center',
      border: '1px solid', borderColor: 'divider', borderRadius: 1,
      p: '12px 14px', gap: 1,
      '&:focus-within': { borderColor: 'text.secondary', boxShadow: '0 0 0 2px rgba(255,255,255,0.05)' }
    }}>
      <AttachMoney sx={{ color: 'text.secondary', fontSize: 20, flexShrink: 0 }} />
      <Typography sx={{ color: 'text.secondary', fontSize: 14, flexShrink: 0 }}>R$</Typography>
      <Box
        component="input"
        autoFocus={autoFocus}
        value={format(value)}
        onChange={handleChange}
        disabled={disabled}
        placeholder="0,00"
        inputMode="numeric"
        sx={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: 'text.primary', fontSize: 16, fontFamily: 'inherit',
          fontWeight: 600,
          '&::placeholder': { color: 'text.disabled' }
        }}
      />
    </Box>
  );
}

function TxDialog({ type, open, loading, notify, onSubmit }) {
  const { closeModal } = useModalActions();
  const [rawVal, setRawVal] = useState('');
  const [razao, setRazao]   = useState('');

  const cfg = dialogConfig[type] || dialogConfig.add;

  React.useEffect(() => {
    if (open) { setRawVal(''); setRazao(''); }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = parseFloat(rawVal) / 100;
    if (!v || v <= 0) return notify('Insira um valor válido maior que zero.', 'error');
    if (cfg.showRazao && !razao.trim()) return notify('Por favor, informe uma razão/descrição.', 'error');
    await onSubmit(v, razao);
  };

  return (
    <Dialog
      open={open}
      onClose={closeModal}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(6px)', bgcolor: 'rgba(0,0,0,0.6)' } }
      }}
      PaperProps={{
        sx: { border: '1px solid', borderColor: 'divider', backgroundImage: 'none' }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 1.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: `${cfg.submitColor}.main`, color: 'white', opacity: 0.9
              }}>
                {cfg.icon}
              </Box>
              <Typography variant="h6" fontWeight={700}>{cfg.title}</Typography>
            </Box>
            <Button
              variant="text" color="inherit" size="small" onClick={closeModal}
              sx={{ minWidth: 'unset', p: 0.5, opacity: 0.5, '&:hover': { opacity: 1 } }}
            >
              <Close fontSize="small" />
            </Button>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '20px !important', pb: 1 }}>
          <CurrencyInput value={rawVal} onChange={setRawVal} disabled={loading} autoFocus={open} />

          {cfg.showRazao && (
            <Box sx={{
              border: '1px solid', borderColor: 'divider', borderRadius: 1, p: '12px 14px',
              '&:focus-within': { borderColor: 'text.secondary' }
            }}>
              <Box
                component="textarea"
                value={razao}
                onChange={e => setRazao(e.target.value)}
                disabled={loading}
                placeholder="Razão / Descrição *"
                rows={2}
                sx={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                  color: 'text.primary', fontSize: 16, fontFamily: 'inherit',
                  '&::placeholder': { color: 'text.disabled' }
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" disabled={loading} onClick={closeModal} sx={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            type="submit" variant="contained" color={cfg.submitColor}
            disabled={loading} sx={{ flex: 1 }}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Aguarde...' : cfg.submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function ModalsTx({ loadingAction, handleAction, notify, adicionarValor, removerValor, definirMeta }) {
  const { activeActionModal } = useModalState();
  const { closeModal }        = useModalActions();

  const actionMap = { add: adicionarValor, remove: removerValor, meta: definirMeta };

  return (
    <>
      {['add', 'remove', 'meta'].map(type => (
        <TxDialog
          key={type}
          type={type}
          open={activeActionModal === type}
          loading={loadingAction}
          notify={notify}
          onSubmit={(v, razao) =>
            handleAction(actionMap[type], v, razao).then(() => closeModal())
          }
        />
      ))}
    </>
  );
}
