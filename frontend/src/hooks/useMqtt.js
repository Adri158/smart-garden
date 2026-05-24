import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getMqttClient } from '../services/mqttService';
import { updateLive, setOnline, resetLive } from '../redux/slices/sensorSlice';
import { mqttTopic, OFFLINE_THRESHOLD_MS } from '../utils/constants';

export function useMqtt(deviceId) {
  const dispatch = useDispatch();
  const lastMsgRef = useRef(null);
  const offlineTimerRef = useRef(null);

  useEffect(() => {
    if (!deviceId) return;

    const client = getMqttClient();


    const topics = [
      mqttTopic(deviceId, 'sensor/soil'),
      mqttTopic(deviceId, 'sensor/dht'),
      mqttTopic(deviceId, 'sensor/ds18b20'),
      mqttTopic(deviceId, 'sensor/hum'),
      mqttTopic(deviceId, 'status/relay'),
      mqttTopic(deviceId, 'status/mode'),
      mqttTopic(deviceId, 'status/device'),
    ];


    topics.forEach((t) => client.subscribe(t, { qos: 0 }));


    function onMessage(topic, messageBuffer, packet) {
      const payload = messageBuffer.toString().trim();


      if (!packet.retain) {
        lastMsgRef.current = Date.now();
        dispatch(setOnline(true));
      }

      if (topic === mqttTopic(deviceId, 'sensor/soil')) {
        dispatch(updateLive({ field: 'soil', value: parseFloat(payload) }));
      } else if (topic === mqttTopic(deviceId, 'sensor/dht')) {
        dispatch(updateLive({ field: 'temp_dht', value: parseFloat(payload) }));
      } else if (topic === mqttTopic(deviceId, 'sensor/ds18b20')) {
        dispatch(updateLive({ field: 'temp_ds', value: parseFloat(payload) }));
      } else if (topic === mqttTopic(deviceId, 'sensor/hum')) {
        dispatch(updateLive({ field: 'humidity', value: parseFloat(payload) }));
      } else if (topic === mqttTopic(deviceId, 'status/relay')) {
        dispatch(updateLive({ field: 'relay', value: payload }));
      } else if (topic === mqttTopic(deviceId, 'status/mode')) {
        dispatch(updateLive({ field: 'mode', value: payload }));
      } else if (topic === mqttTopic(deviceId, 'status/device')) {
        dispatch(updateLive({ field: 'deviceStatus', value: payload }));
      }
    }

    client.on('message', onMessage);


    offlineTimerRef.current = setInterval(() => {
      const last = lastMsgRef.current;
      if (last && Date.now() - last > OFFLINE_THRESHOLD_MS) {
        dispatch(setOnline(false));
      } else if (!last) {


      }
    }, 1000);

    return () => {

      topics.forEach((t) => client.unsubscribe(t));
      client.removeListener('message', onMessage);
      clearInterval(offlineTimerRef.current);
      dispatch(resetLive());
    };
  }, [deviceId, dispatch]);
}
