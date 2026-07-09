import { useState, useEffect, useCallback } from 'react';
import { fetchResumo, iniciarSistema, definirMeta } from './api';
import DashboardMaterial from './dashboards/material/DashboardMaterial';
import './App.css';
import {
  ThemeProvider, createTheme, CssBaseline,
  Box, Card, CardContent, Typography, TextField,
  Button, InputAdornment, Snackbar, Alert
} from '@mui/material';

function App() {
  const [isNovo, setIsNovo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [runTour, setRunTour] = useState(false);

  const initStart = new Date();
  initStart.setDate(1);
  const formatYMD = (d) => d.toISOString().split('T')[0];

  const [dateRange, setDateRange] = useState({
    start: formatYMD(initStart),
    end: formatYMD(new Date()),
    all: false
  });

  const verificarSistema = useCallback(async () => {
    try {
      const result = await fetchResumo();
      if (result.saldo_inicial === 0 && result.saldo === 0 && result.adicionado === 0 && result.removido === 0) {
        setIsNovo(true);
      } else {
        setIsNovo(false);
      }
    } catch (error) {
      console.error("Erro ao verificar sistema:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verificarSistema();
  }, [verificarSistema]);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    verificarSistema();
  }, [verificarSistema]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (isNovo) {
    return <Onboarding onComplete={() => { setIsNovo(false); setRunTour(true); triggerRefresh(); }} />;
  }

  return (
    <DashboardMaterial
      dateRange={dateRange}
      setDateRange={setDateRange}
      refreshTrigger={refreshTrigger}
      triggerRefresh={triggerRefresh}
      runTour={runTour}
      setRunTour={setRunTour}
    />
  );
}

const baseDashboardTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4f46e5' },
    success: { main: '#10b981' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    info: { main: '#3b82f6' },
    background: {
      default: '#0b0f19',
      paper: '#12192b',
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
});

function Onboarding({ onComplete }) {
  const [displayValue, setDisplayValue] = useState('');
  const [rawValue, setRawValue] = useState(0);

  const [displayMeta, setDisplayMeta] = useState('');
  const [rawMeta, setRawMeta] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const formatCurrency = (valStr) => {
    let val = valStr.replace(/\D/g, '');
    if (val === '') return { display: '', raw: 0 };
    const numValue = parseInt(val, 10) / 100;
    return {
      display: numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      raw: numValue
    };
  };

  const handleInputChange = (e) => {
    const { display, raw } = formatCurrency(e.target.value);
    setDisplayValue(display);
    setRawValue(raw);
  };

  const handleMetaChange = (e) => {
    const { display, raw } = formatCurrency(e.target.value);
    setDisplayMeta(display);
    setRawMeta(raw);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rawValue || rawValue <= 0) {
      setErrorMsg("Insira um valor maior que zero para inicializar o seu saldo.");
      return;
    }

    setSubmitting(true);
    try {
      await iniciarSistema(rawValue);
      if (rawMeta > 0) {
        await definirMeta(rawMeta);
      }
      await onComplete();
    } catch {
      setErrorMsg("Erro ao iniciar o sistema. Tente novamente.");
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={baseDashboardTheme}>
      <CssBaseline />
      <Box sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        p: { xs: 2, md: 3 },
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>

        <Box display="flex" flexDirection="column" gap={0} mb={5} alignItems="center" textAlign="center">
          <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Finance Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Visão geral e controle das suas finanças.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Card variant="outlined" sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>

              <Typography variant="h6" fontWeight={600} mb={1}>
                Configuração Inicial
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                Bem-vindo ao sistema. Informe seu saldo atual para abrirmos o seu caixa de forma consolidada e acompanharmos sua evolução.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Typography variant="body2" fontWeight={500} mb={1}>
                  Saldo Atual (Obrigatório)
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  type="text"
                  inputProps={{ inputMode: 'numeric' }}
                  placeholder="0,00"
                  value={displayValue}
                  onChange={handleInputChange}
                  disabled={submitting}
                  autoFocus
                  sx={{
                    mb: 3,
                    '& input': {
                      padding: '16.5px 14px !important',
                      border: 'none !important',
                      background: 'transparent !important',
                      outline: 'none !important',
                      boxShadow: 'none !important',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography color="text.secondary" fontWeight={500}>R$</Typography>
                      </InputAdornment>
                    ),
                    sx: { bgcolor: 'background.default', borderRadius: 1 }
                  }}
                />

                <Typography variant="body2" fontWeight={500} mb={1}>
                  Meta a Atingir (Opcional)
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  type="text"
                  inputProps={{ inputMode: 'numeric' }}
                  placeholder="0,00"
                  value={displayMeta}
                  onChange={handleMetaChange}
                  disabled={submitting}
                  sx={{
                    mb: 4,
                    '& input': {
                      padding: '16.5px 14px !important',
                      border: 'none !important',
                      background: 'transparent !important',
                      outline: 'none !important',
                      boxShadow: 'none !important',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography color="text.secondary" fontWeight={500}>R$</Typography>
                      </InputAdornment>
                    ),
                    sx: { bgcolor: 'background.default', borderRadius: 1 }
                  }}
                />

                <Button
                  type="submit"
                  variant="outlined"
                  color="success"
                  fullWidth
                  disabled={submitting || rawValue <= 0}
                  sx={{
                    py: 1.2,
                    border: '1px solid',
                    borderColor: 'success.main',
                    color: 'success.main',
                    bgcolor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderColor: 'success.main',
                    }
                  }}
                >
                  {submitting ? 'Salvando...' : '+ Iniciar Caixa'}
                </Button>
              </form>

            </CardContent>
          </Card>
        </Box>

        <Snackbar
          open={!!errorMsg}
          autoHideDuration={4000}
          onClose={() => setErrorMsg('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" variant="filled" sx={{ borderRadius: 3 }}>
            {errorMsg}
          </Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
}

export default App;

