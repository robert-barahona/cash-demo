import { useEffect, useState } from "react"
import { useCash } from '../../hooks/useCash';
import { Test } from "../../components/Test";

export const HomePage = () => {

  const { connected, initializeCashServices, releaseDevices } = useCash();

  const [testVisible, setTestVisible] = useState(false);

  useEffect(() => {
    return () => {
      // Close MQTT connection and release devices
    }
  }, [])

  const start = () => {
    initializeCashServices();
    setTimeout(() => {
      setTestVisible(true);
    }, 3000);
  }

  return (
    <div>
      <span>
        MQTT: {connected ? 'Conectado' : 'Desconectado'}
      </span>
      <button type="button" onClick={start}>Conectar</button>
      <button type="button" onClick={releaseDevices}>Release devices</button>
      {testVisible && <Test />}
    </div>
  )
}
