import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: API_BASE });

export const getServerStats = () =>
  api.get('/api/server/stats').then((r) => r.data.data ?? r.data);
