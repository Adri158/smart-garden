import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: API_BASE });

export const getGlobalSettings = () =>
  api.get('/api/settings').then((r) => r.data.data ?? r.data);

export const getDeviceSettings = (deviceId) =>
  api
    .get(`/api/devices/${deviceId}/settings`)
    .then((r) => r.data.data ?? r.data);

export const updateDeviceSettings = (deviceId, payload, apiKey) =>
  api
    .put(`/api/devices/${deviceId}/settings`, payload, {
      headers: { 'X-API-Key': apiKey },
    })
    .then((r) => r.data);
