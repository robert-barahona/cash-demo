import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { cashThunks } from "../../store/slices/cash/cashThunks";
import { useMqtt } from '../../hooks/useMqtt';
import { IMqttPubMessage } from '../../interfaces/IMqttPubMessage';
import { useCash } from '../../hooks/useCash';
import { ICashState } from "../../store/slices/cash/cashSlice";

export const HomePage = () => {

  const dispatch = useDispatch();
  const cashConfig = useSelector((state: any) => (state.cash as ICashState).config);
  const laneInfo = useSelector((state: any) => (state.cash as ICashState).laneInfo);
  const mqtt = useMqtt();
  const { requestTokenTopic, responseTokenTopic } = useCash();

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
    mqtt.subscribe(responseTokenTopic());
  }, [mqtt.connected])

  useEffect(() => {
    if (!mqtt.connected || !laneInfo) return;
    setTimeout(() => {
      requestToken();
    }, 500);
  }, [mqtt.connected, laneInfo])

  const requestToken = () => {
    const message: IMqttPubMessage = {
      event: 'registerClient',
      params: {
        auth: {
          type: 'none',
        },
        client: {
          id: 'asdf',
        },
        source: {
          retailer: laneInfo?.retailer,
          store: laneInfo?.storeId,
          uuid: laneInfo?.uuid,
        }
      }
    }
    mqtt.publish(requestTokenTopic(), JSON.stringify(message), {
      properties: {
        responseTopic: responseTokenTopic(),
      }
    });
  }

  return (
    <div>HomePage</div>
  )
}
