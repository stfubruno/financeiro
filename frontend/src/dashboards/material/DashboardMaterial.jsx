import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Snackbar, Alert } from '@mui/material';
import { Joyride, STATUS } from 'react-joyride';
import { useFinanceLogic } from '../../shared/useFinanceLogic';
import { ModalProvider } from '../../shared/ModalContext';

import HeaderDateRange from '../../components/HeaderDateRange';
import MetricCards from '../../components/MetricCards';
import ChartsPanel from '../../components/ChartsPanel';
import HistoryPanel from '../../components/HistoryPanel';
import ModalsTx from '../../components/ModalsTx';

function DashboardInner({ mode, setMode, dateRange, setDateRange, refreshTrigger, triggerRefresh, runTour, setRunTour }) {
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'info' });

  const notify = useCallback((msg, severity = 'info') => {
    setToast({ open: true, msg, severity });
  }, []);

  const closeToast = useCallback(() => {
    setToast(t => ({ ...t, open: false }));
  }, []);

  const {
    loadingAction,
    handleAction, handleDeleteTx,
    adicionarValor, removerValor, definirMeta,
  } = useFinanceLogic({ reload: triggerRefresh, notify });

  const [{ steps }] = useState({
    steps: [
      {
        target: '.tour-header',
        content: 'Bem-vindo ao seu novo painel Financeiro! Aqui você seleciona o período e o modo claro/escuro.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '.tour-cards',
        content: 'Estes cartões mostram os saldos acumulados, as entradas e a sua Meta configurada!',
        placement: 'bottom',
      },
      {
        target: '.tour-add-tx',
        content: 'Adicione suas entradas e saídas de capital de forma ágil por aqui para alimentar a base!',
        placement: 'left',
      },
      {
        target: '.tour-charts',
        content: 'Toda a evolução e variação líquida do seu patrimônio serão detalhadas e destrinchadas automaticamente nestes gráficos inteligentes de análise.',
        placement: 'top',
      }
    ]
  });

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', p: { xs: 2, md: 3 }, borderRadius: 3 }}>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          skip: 'Pular Tour'
        }}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#4f46e5',
            backgroundColor: '#ffffff',
            textColor: '#111827',
            arrowColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.7)'
          }
        }}
      />

      <HeaderDateRange
        mode={mode}
        setMode={setMode}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <MetricCards dateRange={dateRange} refreshTrigger={refreshTrigger} />

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 480px', xl: '1fr 520px' },
        gap: 3,
        alignItems: 'start',
      }}>
        <ChartsPanel dateRange={dateRange} refreshTrigger={refreshTrigger} />

        <Box sx={{ position: 'sticky', top: 16, zIndex: 10 }}>
          <HistoryPanel
            dateRange={dateRange}
            refreshTrigger={refreshTrigger}
            handleDeleteTx={handleDeleteTx}
            loadingAction={loadingAction}
          />
        </Box>
      </Box>

      <ModalsTx
        loadingAction={loadingAction}
        handleAction={handleAction}
        notify={notify}
        adicionarValor={adicionarValor}
        removerValor={removerValor}
        definirMeta={definirMeta}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeToast} severity={toast.severity} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function DashboardMaterial({ dateRange, setDateRange, refreshTrigger, triggerRefresh, runTour, setRunTour }) {
  const [mode, setMode] = useState('dark');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary:  { main: '#4f46e5' },
      success:  { main: '#10b981' },
      error:    { main: '#ef4444' },
      warning:  { main: '#f59e0b' },
      info:     { main: '#3b82f6' },
      background: {
        default: mode === 'light' ? '#f4f6f8' : '#0b0f19',
        paper:   mode === 'light' ? '#ffffff' : '#12192b',
      },
    },
    shape: { borderRadius: 12 },
    typography: { fontFamily: '"Outfit", sans-serif' },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 4, textTransform: 'none', fontWeight: 600 }
        }
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 16 } }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.25)',
              borderWidth: 1,
            }
          }
        }
      },
    }
  }), [mode]);

  return (
    <ModalProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DashboardInner
          mode={mode}
          setMode={setMode}
          dateRange={dateRange}
          setDateRange={setDateRange}
          refreshTrigger={refreshTrigger}
          triggerRefresh={triggerRefresh}
          runTour={runTour}
          setRunTour={setRunTour}
        />
      </ThemeProvider>
    </ModalProvider>
  );
}
