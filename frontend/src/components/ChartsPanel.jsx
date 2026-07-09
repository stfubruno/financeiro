import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { ShowChart, BarChart as BarChartIcon } from '@mui/icons-material';
import { MemoAreaChart, MemoStackedAreaChart, MemoNetBarChart } from '../shared/Charts';
import { fetchGraficos } from '../api';

export default React.memo(function ChartsPanel({ dateRange, refreshTrigger }) {
  const [data, setData] = useState({ grafico_evolucao: [], fluxo_mensal: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const { start, end, all } = dateRange;
    setLoading(true);

    fetchGraficos(all ? '' : start, all ? '' : end)
      .then(res => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Erro no ChartsPanel:", err);
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [dateRange, refreshTrigger]);

  const { chartData, barData, netData } = useMemo(() => {
    const bars = data.fluxo_mensal || [];
    return {
      chartData: data.grafico_evolucao || [],
      barData: bars,
      netData: bars.map(m => ({ name: m.name, net: parseFloat((m.add - m.remove).toFixed(2)) }))
    };
  }, [data]);

  const processedChartData = useMemo(() => {
    if (chartData.length <= 60) return chartData;
    const monthly = {};
    for (const pt of chartData) {
      const parts = pt.fullDate ? pt.fullDate.split(' ')[0].split('/') : null;
      const key = parts ? `${parts[1]}/${parts[2]}` : pt.name;
      monthly[key] = { ...pt, name: key };
    }
    return Object.values(monthly);
  }, [chartData]);

  const panelHeight = 300;
  const isLoad = loading;

  return (
    <Box className="tour-charts" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <ShowChart color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Evolução Patrimonial {dateRange.all && '(Histórico Completo)'}
            </Typography>
          </Box>
          <Box sx={{ height: panelHeight }}>
            {isLoad ? (
              <Skeleton variant="rounded" width="100%" height="100%" />
            ) : processedChartData.length === 0 ? (
              <Box 
                display="flex" 
                flexDirection="column"
                alignItems="center" 
                justifyContent="center"
                height="100%"
                gap={1.5}
                sx={{ opacity: 0.5 }}
              >
                <ShowChart sx={{ fontSize: 48 }} />
                <Typography variant="body2" color="text.secondary">
                  Nenhuma movimentação encontrada no período.
                </Typography>
              </Box>
            ) : (
              <MemoAreaChart data={processedChartData} />
            )}
          </Box>
        </CardContent>
      </Card>

      {(isLoad || barData.length > 0) && (
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <BarChartIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>Fluxo de Caixa (Empilhado)</Typography>
            </Box>
            <Box sx={{ height: panelHeight }}>
              {isLoad ? (
                <Skeleton variant="rounded" width="100%" height="100%" />
              ) : (
                <MemoStackedAreaChart data={barData} />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {(isLoad || netData.length > 0) && (
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <BarChartIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>Saldo Líquido Mensal</Typography>
            </Box>
            <Box sx={{ height: panelHeight }}>
              {isLoad ? (
                <Skeleton variant="rounded" width="100%" height="100%" />
              ) : (
                <MemoNetBarChart data={netData} />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
});
