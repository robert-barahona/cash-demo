import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { cashThunks } from "../../store/slices/cash/cashThunks";
import { useCash } from '../../hooks/useCash';
import { ICashState } from "../../store/slices/cash/cashSlice";

export const HomePage = () => {

  const dispatch = useDispatch();
  const cashConfig = useSelector((state: any) => (state.cash as ICashState).config);
  const laneInfo = useSelector((state: any) => (state.cash as ICashState).laneInfo);

  const {
    connected,
    connectMqtt,
    requestDevices,
    requestToken,
    startSubscriptions,
  } = useCash();

  useEffect(() => {
    dispatch(cashThunks.getConfig());
    dispatch(cashThunks.getLaneInfo());

    return () => {
      // Close MQTT connection and release devices
    }
  }, [])

  useEffect(() => {
    if (!cashConfig?.broker_host_external) return;
    connectMqtt(cashConfig.broker_host_external, cashConfig.broker_port_external_websockets);
  }, [cashConfig])

  useEffect(() => {
    if (!connected) return;
    startSubscriptions();
  }, [connected])

  useEffect(() => {
    if (!connected || !laneInfo) return;
    setTimeout(() => {
      requestToken(laneInfo);
    }, 500);
    setTimeout(() => {
      requestDevices();
    }, 700);
  }, [connected, laneInfo])

  return (
    <div>HomePage</div>
  )
}
