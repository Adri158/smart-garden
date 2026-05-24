import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: API_BASE });

export const getLatestSensor = (deviceId) =>
  api
    .get(`/api/devices/${deviceId}/sensors/latest`)
    .then((r) => {
      const d = r.data.data ?? r.data;
      if (d) {

        d.relay = (d.relay === 1 || d.relay === 'ON') ? 'ON' : 'OFF';
        d.mode  = d.mode ?? 'MANUAL';
      }
      return d;
    });

export const getSensorHistory = (deviceId, sensor = 'soil', range = '24h', signal) =>
  api
    .get(`/api/devices/${deviceId}/sensors`, { params: { sensor, range }, signal })
    .then((r) => {
      const d = r.data.data ?? r.data;
      if (d && Array.isArray(d.labels) && Array.isArray(d.values)) {
        return d.labels.map((label, i) => ({ label, value: d.values[i] }));
      }
      return Array.isArray(d) ? d : [];
    });

export const logSensor = (deviceId, payload, apiKey) =>
  api
    .post(`/api/devices/${deviceId}/sensors`, payload, {
      headers: { 'X-API-Key': apiKey },
    })
    .then((r) => r.data);
