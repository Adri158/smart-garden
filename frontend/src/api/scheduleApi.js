import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: API_BASE });

const authHeader = (apiKey) => ({ headers: { 'X-API-Key': apiKey } });

export const getSchedules = () =>
  api.get('/api/schedules').then((r) => r.data.data ?? r.data);

export const createSchedule = (payload, apiKey) =>
  api
    .post('/api/schedules', payload, authHeader(apiKey))
    .then((r) => r.data);

export const updateSchedule = (id, payload, apiKey) =>
  api
    .put(`/api/schedules/${id}`, payload, authHeader(apiKey))
    .then((r) => r.data);

export const deleteSchedule = (id, apiKey) =>
  api
    .delete(`/api/schedules/${id}`, authHeader(apiKey))
    .then((r) => r.data);
