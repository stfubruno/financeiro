import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Skeleton, IconButton } from '@mui/material';
import { ArrowUpward, ArrowDownward, TrackChanges, AttachMoney } from '@mui/icons-material';
import { formatCurrency } from '../shared/formatters';
import { fetchResumo } from '../api';
import { useModalActions } from '../shared/ModalContext';

export default React.memo(function MetricCards({ dateRange, refreshTrigger }) {
  const { openModal } = useModalActions();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const { start, end, all } = dateRange;
    setLoading(true);

    fetchResumo(all ? '' : start, all ? '' : end)
      .then(res => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Erro no MetricCards:", err);
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [dateRange, refreshTrigger]);

  const isLoad = loading || !data;

  const progressoMeta = (!isLoad && data.meta > 0)
    ? parseFloat(Math.min((data.saldo_total / data.meta) * 100, 100).toFixed(1))
    : 0;

  const totalMovimentado = !isLoad ? (data.adicionado || 0) + (data.removido || 0) : 0;
  const percEntradas = (!isLoad && totalMovimentado > 0) ? ((data.adicionado / totalMovimentado) * 100).toFixed(1) : '0.0';
  const percSaidas = (!isLoad && totalMovimentado > 0) ? ((data.removido / totalMovimentado) * 100).toFixed(1) : '0.0';

  return (
    <Box className="tour-cards" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
      <Card variant="outlined" sx={{ minHeight: 110 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="body2" color="text.secondary">Saldo Atual</Typography>
            <Box sx={{ color: 'primary.main' }}><AttachMoney /></Box>
          </Box>
          {isLoad ? (
            <Skeleton variant="text" width="60%" height={40} />
          ) : (
            <Typography variant="h5" fontWeight={700}>{formatCurrency(data.saldo_total)}</Typography>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ minHeight: 110 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="body2" color="text.secondary">Meta</Typography>
            <IconButton
              size="small"
              color="info"
              title="Definir Meta"
              onClick={() => openModal('meta')}
              sx={{
                p: 0.5, mr: -0.5, mt: -0.5,
                border: '1px solid',
                borderColor: 'info.main',
                borderRadius: 1.5,
                '&:hover': { bgcolor: 'info.main', color: 'white' }
              }}
            >
              <TrackChanges fontSize="small" />
            </IconButton>
          </Box>
          {isLoad ? (
            <>
              <Skeleton variant="text" width="50%" height={40} />
              <Skeleton variant="rounded" width="100%" height={6} sx={{ mt: 1.5 }} />
              <Skeleton variant="text" width="30%" height={20} sx={{ mt: 0.5 }} />
            </>
          ) : (
            <>
              <Typography variant="h5" fontWeight={700}>{formatCurrency(data.meta)}</Typography>
              {data.meta > 0 && (
                <>
                  <LinearProgress variant="determinate" value={progressoMeta} color="info" sx={{ mt: 1.5, height: 6, borderRadius: 3 }} />
                  <Typography variant="caption" color="info.main" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
                    {progressoMeta}% concluída
                  </Typography>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ minHeight: 110 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="body2" color="text.secondary">Total Adicionado</Typography>
            <Box sx={{ color: 'success.main' }}><ArrowUpward /></Box>
          </Box>
          {isLoad ? (
            <>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" height={24} sx={{ mt: 0.5 }} />
            </>
          ) : (
            <>
              <Typography variant="h5" fontWeight={700}>{formatCurrency(data.adicionado)}</Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <ArrowUpward sx={{ color: 'success.main', fontSize: 14 }} />
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  {totalMovimentado > 0 ? `${percEntradas}% do volume total` : '0% do volume total'}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ minHeight: 110 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="body2" color="text.secondary">Total Removido</Typography>
            <Box sx={{ color: 'error.main' }}><ArrowDownward /></Box>
          </Box>
          {isLoad ? (
            <>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" height={24} sx={{ mt: 0.5 }} />
            </>
          ) : (
            <>
              <Typography variant="h5" fontWeight={700}>{formatCurrency(data.removido)}</Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <ArrowDownward sx={{ color: 'error.main', fontSize: 14 }} />
                <Typography variant="caption" color="error.main" fontWeight={600}>
                  {totalMovimentado > 0 ? `${percSaidas}% do volume total` : '0% do volume total'}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
});
