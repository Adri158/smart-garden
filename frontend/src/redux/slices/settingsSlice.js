import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDeviceSettings, getGlobalSettings } from '../../api/settingsApi';
import { getSchedules } from '../../api/scheduleApi';

export const fetchSettings = createAsyncThunk(
  'settings/fetchDevice',
  async (deviceId, { rejectWithValue }) => {
    try {
      return await getDeviceSettings(deviceId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchGlobalSettings = createAsyncThunk(
  'settings/fetchGlobal',
  async (_, { rejectWithValue }) => {
    try {
      return await getGlobalSettings();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSchedules = createAsyncThunk(
  'settings/fetchSchedules',
  async (_, { rejectWithValue }) => {
    try {
      return await getSchedules();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {

    device: {
      soil_min: 40,
      soil_max: 80,
      temp_max: 35,
      hum_min: 40,
      publish_interval: 5000,
    },
    global: {},
    schedules: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.device = { ...state.device, ...action.payload };
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchGlobalSettings.fulfilled, (state, action) => {
        state.global = action.payload;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.schedules = action.payload;
      });
  },
});

export default settingsSlice.reducer;
