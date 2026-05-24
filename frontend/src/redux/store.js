import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from './slices/deviceSlice';
import sensorReducer from './slices/sensorSlice';
import settingsReducer from './slices/settingsSlice';

const store = configureStore({
  reducer: {
    devices: deviceReducer,
    sensor: sensorReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {

        ignoredPaths: ['sensor.live.lastSeen'],
      },
    }),
});

export default store;
