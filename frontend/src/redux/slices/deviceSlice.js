import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDevices, getDevice } from '../../api/deviceApi';

export const fetchDevices = createAsyncThunk('devices/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getDevices();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchDevice = createAsyncThunk('devices/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return await getDevice(id);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const deviceSlice = createSlice({
  name: 'devices',
  initialState: {
    list: [],           
    selectedId: null,   
    detail: null,       
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedDevice(state, action) {
      state.selectedId = action.payload;
      state.detail = null; 
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;

        if (!state.selectedId && action.payload.length > 0) {
          state.selectedId = action.payload[0].device_id;
        }
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDevice.fulfilled, (state, action) => {
        state.detail = action.payload;
      });
  },
});

export const { setSelectedDevice } = deviceSlice.actions;
export default deviceSlice.reducer;
