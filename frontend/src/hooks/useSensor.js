import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLatestSensor, fetchSensorHistory } from '../redux/slices/sensorSlice';
import { useMqtt } from './useMqtt';

export function useSensor(deviceId) {
  const dispatch = useDispatch();
  const { live, latest, history, historyLoading, historySensor, historyRange } =
    useSelector((s) => s.sensor);


  useMqtt(deviceId);


  useEffect(() => {
    if (!deviceId) return;
    dispatch(fetchLatestSensor(deviceId));
  }, [deviceId, dispatch]);


  useEffect(() => {
    if (!deviceId) return;
    dispatch(fetchSensorHistory({ deviceId, sensor: historySensor, range: historyRange }));
  }, [deviceId, historySensor, historyRange, dispatch]);

  return {
    live,
    latest,
    history,
    historyLoading,
    historySensor,
    historyRange,
  };
}
