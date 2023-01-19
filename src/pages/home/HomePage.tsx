import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { cashThunks } from "../../store/slices/cash/cashThunks";
import { useMqtt } from '../../hooks/useMqtt';
import { useCash } from '../../hooks/useCash';
import { ICashState } from "../../store/slices/cash/cashSlice";

export const HomePage = () => {

  const dispatch = useDispatch();
  const cashConfig = useSelector((state: any) => (state.cash as ICashState).config);
  const laneInfo = useSelector((state: any) => (state.cash as ICashState).laneInfo);
  const mqtt = useMqtt();
  const {
    getRquestDeviceJson,
    getRequestTokenJson,
    requestCashTopic,
    responseCashTopic,
    requestTokenTopic,
    responseTokenTopic,
  } = useCash();

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
    mqtt.subscribe(responseCashTopic());
  }, [mqtt.connected])

  useEffect(() => {
    if (!mqtt.connected || !laneInfo) return;
    setTimeout(() => {
      requestToken();
    }, 500);
    setTimeout(() => {
      requestDevices();
    }, 700);
  }, [mqtt.connected, laneInfo])

  const requestToken = () => {
    if (!laneInfo) return;
    const message = getRequestTokenJson(laneInfo);
    mqtt.publish(requestTokenTopic(), JSON.stringify(message), {
      properties: {
        responseTopic: responseTokenTopic(),
      }
    });
  }

  const requestDevices = () => {
    const message = getRquestDeviceJson();
    mqtt.publish(requestCashTopic(), JSON.stringify(message), {
      properties: {
        responseTopic: responseCashTopic(),
      }
    })
  }

  return (
    <div>HomePage</div>
  )
}
