import React, { useState, useEffect, useMemo, useCallback, useDeferredValue, useRef } from 'react';
import {
  Card, CardContent, Typography, Box, IconButton, Tooltip,
  InputBase, Paper, CircularProgress, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import { DeleteOutline, Search, Receipt, TrackChanges, WarningAmber } from '@mui/icons-material';
import { formatCurrency } from '../shared/formatters';
import { fetchHistorico } from '../api';
import { useModalActions } from '../shared/ModalContext';

const ITEM_HEIGHT = 80;
const OVERSCAN = 5;

function useVirtualList(containerRef, itemCount, itemHeight) {
  const [range, setRange] = useState({ start: 0, end: 20 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const scrollTop = el.scrollTop;
      const viewHeight = el.clientHeight;
      const rawStart = Math.floor(scrollTop / itemHeight);
      const rawEnd = Math.ceil((scrollTop + viewHeight) / itemHeight);
      setRange({
        start: Math.max(0, rawStart - OVERSCAN),
        end: Math.min(itemCount, rawEnd + OVERSCAN),
      });
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, [containerRef, itemCount, itemHeight]);

  return range;
}

const TxRow = React.memo(function TxRow({ tx, style, onDeleteClick, loadingAction }) {
  const isAdd = tx.acao === 'add' || tx.acao === 'start';
  return (
    <div style={{ ...style, padding: '4px 20px', boxSizing: 'border-box' }}>
      <Paper
        variant="outlined"
        sx={{
          px: 2, height: ITEM_HEIGHT - 8,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 1, bgcolor: 'background.paper',
          transition: 'transform 0.12s, box-shadow 0.12s',
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
          <Box sx={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: isAdd ? 'success.main' : 'error.main', color: 'white'
          }}>
            {tx.acao === 'start' ? <TrackChanges sx={{ fontSize: 17 }} /> : <Receipt sx={{ fontSize: 17 }} />}
          </Box>
          <Box minWidth={0}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160 }}>
              {tx.razao || (tx.acao === 'start' ? 'Saldo Inicial' : 'Sem razão')}
            </Typography>
            <Typography variant="caption" color="text.secondary">{tx.data}</Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
          <Typography variant="body2" fontWeight={700} color={isAdd ? 'success.main' : 'error.main'}>
            {isAdd ? '+' : '-'} {formatCurrency(tx.quantidade)}
          </Typography>
          <Tooltip title="Excluir" placement="top">
            <span>
              <IconButton size="small" color="error" onClick={() => onDeleteClick(tx)} disabled={loadingAction}
                sx={{ '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                <DeleteOutline sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>
    </div>
  );
});

export default React.memo(function HistoryPanel({ dateRange, refreshTrigger, handleDeleteTx, loadingAction }) {
  const { openModal } = useModalActions();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmTx, setConfirmTx] = useState(null);
  const listRef = useRef(null);

  const deferredSearch = useDeferredValue(searchTerm);

  useEffect(() => {
    let active = true;
    const { start, end, all } = dateRange;
    setLoading(true);

    fetchHistorico('', all ? '' : start, all ? '' : end)
      .then(res => {
        if (active) { setData(res.historico || []); setLoading(false); }
      })
      .catch(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [dateRange, refreshTrigger]);

  const filteredHistory = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    if (!term) return data;
    return data.filter(tx => {
      const razao = (tx.razao || '').toLowerCase();
      const valor = String(tx.quantidade ?? '');
      const dataTxt = tx.data || '';
      return razao.includes(term) || valor.includes(term) || dataTxt.includes(term);
    });
  }, [data, deferredSearch]);

  const { start: vStart, end: vEnd } = useVirtualList(listRef, filteredHistory.length, ITEM_HEIGHT);
  const totalHeight = filteredHistory.length * ITEM_HEIGHT;

  const handleConfirmDelete = useCallback(() => {
    if (confirmTx) { handleDeleteTx(confirmTx); setConfirmTx(null); }
  }, [confirmTx, handleDeleteTx]);

  return (
    <>
      <Card variant="outlined" sx={{
        display: 'flex', flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        maxHeight: 'calc(100vh - 120px)',
      }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, '&:last-child': { pb: 0 }, overflow: 'hidden' }}>

          <Box className="tour-add-tx" p={2.5} borderBottom="1px solid" borderColor="divider" flexShrink={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Lançamentos{' '}
                <Chip label={filteredHistory.length} size="small" sx={{ ml: 1, fontWeight: 'bold' }} />
              </Typography>
              <Box display="flex" gap={1}>
                <Button variant="outlined" color="success" size="small" onClick={() => openModal('add')}>
                  + Entrada
                </Button>
                <Button variant="outlined" color="error" size="small" onClick={() => openModal('remove')}>
                  - Saída
                </Button>
              </Box>
            </Box>

            <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', borderRadius: 1 }}>
              <Box sx={{ p: '10px', color: 'text.secondary', display: 'flex' }}><Search /></Box>
              <InputBase
                sx={{ flex: 1, fontSize: '0.875rem' }}
                placeholder="Buscar (razão, data ou valor)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {deferredSearch !== searchTerm && (
                <Box sx={{ pr: 1.5, display: 'flex' }}><CircularProgress size={14} /></Box>
              )}
            </Paper>
          </Box>

          <Box
            ref={listRef}
            sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.default', position: 'relative' }}
          >
            {loading ? (
              <Box display="flex" height="100%" alignItems="center" justifyContent="center">
                <CircularProgress />
              </Box>
            ) : filteredHistory.length === 0 ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.disabled" gap={2}>
                <Receipt sx={{ fontSize: 48, opacity: 0.5 }} />
                <Typography>
                  {deferredSearch.trim() ? 'Nenhum resultado para a busca.' : 'Nenhum lançamento no período.'}
                </Typography>
              </Box>
            ) : (
              <div style={{ height: totalHeight, position: 'relative' }}>
                {filteredHistory.slice(vStart, vEnd).map((tx, localIdx) => {
                  const absIdx = vStart + localIdx;
                  return (
                    <TxRow
                      key={tx.data + tx.acao + absIdx}
                      tx={tx}
                      style={{
                        position: 'absolute',
                        top: absIdx * ITEM_HEIGHT,
                        left: 0,
                        right: 0,
                        height: ITEM_HEIGHT,
                      }}
                      onDeleteClick={setConfirmTx}
                      loadingAction={loadingAction}
                    />
                  );
                })}
              </div>
            )}
          </Box>

        </CardContent>
      </Card>

      <Dialog open={!!confirmTx} onClose={() => setConfirmTx(null)} maxWidth="xs" fullWidth
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(6px)', bgcolor: 'rgba(0,0,0,0.6)' } } }}
        PaperProps={{ sx: { border: '1px solid', borderColor: 'divider', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'error.main', color: 'white' }}>
              <WarningAmber />
            </Box>
            <Typography variant="h6" fontWeight={700}>Confirmar Exclusão</Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            A seguinte movimentação será excluída permanentemente:
          </Typography>
          {confirmTx && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: 'background.default' }}>
              <Typography fontWeight={700} noWrap>
                {confirmTx.razao || (confirmTx.acao === 'start' ? 'Saldo Inicial' : 'Sem razão')}
              </Typography>
              <Typography variant="body2" color="text.secondary">{confirmTx.data}</Typography>
              <Typography variant="subtitle1" fontWeight={700}
                color={(confirmTx.acao === 'add' || confirmTx.acao === 'start') ? 'success.main' : 'error.main'}
                mt={0.5}>
                {formatCurrency(confirmTx.quantidade)}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={() => setConfirmTx(null)} disabled={loadingAction} sx={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={loadingAction} sx={{ flex: 1 }}
            startIcon={loadingAction ? <CircularProgress size={16} color="inherit" /> : null}>
            {loadingAction ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
