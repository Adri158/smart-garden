import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLatestSensor, getSensorHistory } from '../../api/sensorApi';

export const fetchLatestSensor = createAsyncThunk(
  'sensor/fetchLatest',
  async (deviceId, { rejectWithValue }) => {
    try {
      return await getLatestSensor(deviceId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSensorHistory = createAsyncThunk(
  'sensor/fetchHistory',
  async ({ deviceId, sensor, range }, { rejectWithValue }) => {
    try {
      const data = await getSensorHistory(deviceId, sensor, range);
      return { sensor, range, data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const sensorSlice = createSlice({
  name: 'sensor',
  initialState: {

    live: {
      soil: null,
      temp_dht: null,
      temp_ds: null,
      humidity: null,
      relay: null,   
      mode: null,    
      online: false,
      lastSeen: null,
    },

    latest: null,
    latestLoading: false,

    history: [],
    historyLoading: false,
    historySensor: 'soil',
    historyRange: '24h',
    error: null,
  },
  reducers: {

    updateLive(state, action) {
      const { field, value } = action.payload;
      state.live[field] = value;
      if (!['relay', 'mode', 'online'].includes(field)) {
        state.live.lastSeen = Date.now();
        state.live.online = true;
      }
    },
    setOnline(state, action) {
      state.live.online = action.payload;
    },
    setHistorySensor(state, action) {
      state.historySensor = action.payload;
    },
    setHistoryRange(state, action) {
      state.historyRange = action.payload;
    },
    resetLive(state) {
      state.live = {
        soil: null,
        temp_dht: null,
        temp_ds: null,
        humidity: null,
        relay: null,
        mode: null,
        online: false,
        lastSeen: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchLatestSensor.pending, (state) => {
        state.latestLoading = true;
        state.error = null;
      })
      .addCase(fetchLatestSensor.fulfilled, (state, action) => {
        state.latestLoading = false;
        state.latest = action.payload;
      })
      .addCase(fetchLatestSensor.rejected, (state, action) => {
        state.latestLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchSensorHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchSensorHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload.data;
        state.historySensor = action.payload.sensor;
        state.historyRange = action.payload.range;
      })
      .addCase(fetchSensorHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateLive,
  setOnline,
  setHistorySensor,
  setHistoryRange,
  resetLive,
} = sensorSlice.actions;

export default sensorSlice.reducer;
