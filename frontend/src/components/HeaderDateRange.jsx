import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

export default function HeaderDateRange({ mode, setMode, dateRange, setDateRange }) {
  
  const [localValue, setLocalValue] = useState([null, null]);

  useEffect(() => {
    const s = dateRange.all || !dateRange.start ? null : dayjs(dateRange.start);
    const e = dateRange.all || !dateRange.end ? null : dayjs(dateRange.end);
    setLocalValue([s, e]);
  }, [dateRange]);

  const handleDateChange = (newValue) => {
    setLocalValue(newValue);
    const [start, end] = newValue;
    
    if (start && end && start.isValid() && end.isValid()) {
      setDateRange({
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD'),
        all: false
      });
    }
  };

  const handleClearHistory = () => {
    setDateRange({ start: '', end: '', all: true });
  }

  const shortcutsItems = [
    { label: 'Últimos 7 dias', getValue: () => [dayjs().subtract(7, 'day'), dayjs()] },
    { label: 'Este mês',       getValue: () => [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Mês passado',    getValue: () => [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] }
  ];

  return (
    <Box 
      className="tour-header"
      display="flex" 
      flexDirection={{ xs: 'column', md: 'row' }} 
      justifyContent="space-between" 
      alignItems={{ xs: 'flex-start', md: 'center' }} 
      gap={2} 
      mb={3}
    >
      <Box>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
          Finance Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
          Visão geral e controle das suas finanças.
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <DateRangePicker
            calendars={1}
            value={localValue}
            onChange={handleDateChange}
            localeText={{ start: 'De', end: 'Até' }}
            slotProps={{
              shortcuts: { items: shortcutsItems },
              textField: {
                size: 'small',
                sx: {
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  width: { xs: '100%', md: 220 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderWidth: '1px',
                  },
                }
              }
            }}
          />
        </LocalizationProvider>

        <Button 
          variant={dateRange.all ? "outlined" : "text"}
          color="inherit"
          onClick={handleClearHistory}
          sx={{ fontWeight: 600, px: 2, height: 40, whiteSpace: 'nowrap' }}
        >
          Histórico Completo
        </Button>

        <IconButton 
          onClick={() => setMode(m => m === 'light' ? 'dark' : 'light')} 
          color="inherit"
          sx={{ 
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
            transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' }
          }}
        >
          {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>
    </Box>
  );
}
