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

    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`MQTT - Unable to subscribe: ${topic}`);
        console.error(err);
      } else {
        console.log(`MQTT - Subscribed: ${topic}`);
      }
    });
  }

  const publish = (topic: string, message: string | Buffer, options?: IClientPublishOptions) => {
    if (!client?.connected) {
      console.error(`MQTT - Unable to publish because client is not connected`);
      return;
    }

    client.publish(topic, message, options ?? {}, (err) => {
      if (err) {
        console.error('MQTT - Unable to Publish', { topic, message });
        console.error(err);
      } else {
        console.log('MQTT - Publish:', { topic, message });
      }
    });
  }

  return {
    connected,
    message,
    connect,
    subscribe,
    publish,
  }

}
