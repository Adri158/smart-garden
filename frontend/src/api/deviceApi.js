import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: API_BASE });

export const getDevices = () =>
  api.get('/api/devices').then((r) => r.data.data ?? r.data);

export const getDevice = (id) =>
  api.get(`/api/devices/${id}`).then((r) => r.data.data ?? r.data);
