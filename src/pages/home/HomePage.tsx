import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { cashThunks } from "../../store/slices/cash/cashThunks";
import { useMqtt } from '../../hooks/useMqtt';

export const HomePage = () => {

  const dispatch = useDispatch();
  const cashConfig = useSelector((state: any) => state.cash.config);
  const mqtt = useMqtt();

  useEffect(() => {
    dispatch(cashThunks.getConfig());
    dispatch(cashThunks.getLaneInfo());

    return () => {
      // Close MQTT Connection
    }
  }, [])

  useEffect(() => {
    if (!cashConfig?.broker_host_external) return;
    mqtt.connect(cashConfig.broker_host_external, cashConfig.broker_port_external_websockets);
  }, [cashConfig])

  useEffect(() => {
    if (!mqtt.connected) return;
    mqtt.subscribe('qa/securetoken/001');
  }, [mqtt.connected])

  return (
    <div>HomePage</div>
  )
}
