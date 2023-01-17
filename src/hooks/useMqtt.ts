import * as mqtt from "mqtt"
import { useState } from "react";
import { MqttHelper } from "../helpers/MqttHelper";
import { IMqttMessage } from "../interfaces/IMqttMessage";

export const useMqtt = () => {

  let client: mqtt.MqttClient;
  const [message, setMessage] = useState<IMqttMessage | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = (broker: string, port: number = 8000) => {
    client = MqttHelper.connect(broker, port);

    client.on('connect', () => {
      console.log(`MQTT Connected ${broker}:${port}`);
      setConnected(true);
    });

    client.on('message', (topic, payload) => {
      console.log(topic, payload.toString());
      setMessage({ topic, payload });
    });
  }

  const subscribe = (topic: string) => {
    if (!client?.connected) return;
    try {
      client.subscribe(topic);
      console.log(`Subscribed to: ${topic}`);
    } catch (error) {
      console.error(`Unable to connect to ${topic}`);
      console.error(error);
    }
  }

  return {
    connected,
    message,
    connect,
    subscribe,
  }

}
