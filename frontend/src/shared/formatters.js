const _currencyFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const _compactFmt = new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 });

export const formatCurrency = (val) => _currencyFmt.format(val || 0);
export const formatCompact = (val) => _compactFmt.format(val || 0);
