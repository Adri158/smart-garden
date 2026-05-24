import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDevices, setSelectedDevice } from '../redux/slices/deviceSlice';

export function useDevices() {
  const dispatch = useDispatch();
  const { list, selectedId, loading, error } = useSelector((s) => s.devices);

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  function selectDevice(id) {
    dispatch(setSelectedDevice(id));
  }

  return {
    devices: list,
    selectedId,
    loading,
    error,
    selectDevice,
  };
}
