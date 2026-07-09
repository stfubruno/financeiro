import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.15.152:8000',
});

export const fetchResumo = async (start = '', end = '') => {
  const params = {};
  if (start) params.start = start;
  if (end) params.end = end;
  const { data } = await api.get('/dados/resumo', { params });
  return data;
};

export const fetchGraficos = async (start = '', end = '') => {
  const params = {};
  if (start) params.start = start;
  if (end) params.end = end;
  const { data } = await api.get('/dados/graficos', { params });
  return data;
};

export const fetchHistorico = async (q = '', start = '', end = '') => {
  const params = {};
  if (q) params.q = q;
  if (start) params.start = start;
  if (end) params.end = end;
  const { data } = await api.get('/dados/historico', { params });
  return data;
};

export const iniciarSistema = async (valor) => {
  const { data } = await api.post('/iniciar', { valor });
  return data;
};

export const adicionarValor = async (valor, razao) => {
  const { data } = await api.post('/adicionar', { valor, razao });
  return data;
};

export const removerValor = async (valor, razao) => {
  const { data } = await api.post('/remover', { valor, razao });
  return data;
};

export const definirMeta = async (valor) => {
  const { data } = await api.post('/meta', { valor });
  return data;
};

export const deletarTransacao = async (txData) => {
  const { data } = await api.delete('/deletar', { data: txData });
  return data;
};

export default api;
