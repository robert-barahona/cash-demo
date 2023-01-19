import { useEffect } from "react"
import { useDispatch } from "react-redux";
import { cashThunks } from "../../store/slices/cash/cashThunks";
import { useCash } from '../../hooks/useCash';

export const HomePage = () => {

  const dispatch = useDispatch();

  const cash = useCash();

  useEffect(() => {
    dispatch(cashThunks.getConfig());
    dispatch(cashThunks.getLaneInfo());

    return () => {
      // Close MQTT connection and release devices
    }
  }, [])

  return (
    <div>HomePage</div>
  )
}
