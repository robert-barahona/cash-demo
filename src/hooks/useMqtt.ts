import * as mqtt from "mqtt"
import { MqttHelper } from "../helpers/MqttHelper";

export const useMqtt = () => {

  let client: mqtt.MqttClient;

  const connect = (broker: string, port: number = 8000) => {
    client = MqttHelper.connect(broker, port);

    client.on('connect', () => {
      console.log('MQTT Connected');
    });
  }

  return {
    connect,
  }

}
