import { MqttClient, IClientPublishOptions } from "mqtt/dist/mqtt"
import { useEffect, useState } from "react";
import { MqttHelper } from "../helpers/MqttHelper";
import { IMqttMessage } from "../interfaces/IMqttMessage";

export const useMqtt = () => {

  const [client, setClient] = useState<MqttClient | null>(null);
  const [message, setMessage] = useState<IMqttMessage | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!client) return;
    client.on('connect', () => {
      console.log(`MQTT - Connected: ${client.options.host}`);
      setConnected(true);
    });

    client.on('message', (topic, payload) => {
      console.log('MQTT - Message:', { topic, payload: payload.toString() });
      setMessage({ topic, payload });
    });
  }, [client])

  const connect = (broker: string, port: number = 8000) => {
    const client = MqttHelper.connect(broker, port);
    setClient(client);
  }

  const subscribe = (topic: string) => {
    if (!client?.connected) {
      console.error(`MQTT - Unable to subscribe to ${topic} because client is not connected`);
      return;
    }

    try {
      client.subscribe(topic);
      console.log(`MQTT - Subscribed: ${topic}`);
    } catch (error) {
      console.error(`MQTT - Unable to subscribe: ${topic}`);
      console.error(error);
    }
  }

  const publish = (topic: string, message: string | Buffer, options?: IClientPublishOptions) => {
    if (!client?.connected) {
      console.error(`MQTT - Unable to publish to ${topic} because client is not connected`);
      return;
    }

    try {
      client.publish(topic, message, options ?? {});
      console.log(`MQTT - Subscribed: ${topic}`);
    } catch (error) {
      console.error(`MQTT - Unable to subscribe: ${topic}`);
      console.error(error);
    }
  }

  return {
    connected,
    message,
    connect,
    subscribe,
    publish,
  }

}
