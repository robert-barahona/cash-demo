import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { cashThunks } from "../../store/slices/cash/cashThunks";
import { useMqtt } from '../../hooks/useMqtt';
import { TOKEN_TOPIC_RES, TOKEN_TOPIC_REQ } from '../../constants/topics';
import { IMqttPubMessage } from '../../interfaces/IMqttPubMessage';

export const HomePage = () => {

  const dispatch = useDispatch();
  const cashConfig = useSelector((state: any) => state.cash.config);
  const laneInfo = useSelector((state: any) => state.cash.laneInfo);
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
    mqtt.subscribe(TOKEN_TOPIC_RES);
    requestToken();
  }, [mqtt.connected])

  const requestToken = () => {
    const message: IMqttPubMessage = {
      event: 'registerClient',
      params: {
        auth: {
          type: 'nope',
        },
        client: {
          id: laneInfo.uuid,
        },
      }
    }
    mqtt.publish(TOKEN_TOPIC_REQ, JSON.stringify(message), {
      properties: {
        responseTopic: TOKEN_TOPIC_RES,
      }
    });
  }

  return (
    <div>HomePage</div>
  )
}
