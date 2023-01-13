import * as mqtt from "mqtt"
import { MqttHelper } from "../helpers/MqttHelper";
import { store } from "../store/store";

export const useMqtt = () => {

  let client: mqtt.MqttClient;

  const connect = () => {
    const { config } = store.getState().cash;
    client = MqttHelper.connect(config.broker_host);

    client.on('connect', () => {
      console.log('MQTT Connected');
    });
  }

  return {
    connect,
  }

}
