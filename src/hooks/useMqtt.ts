import * as mqtt from "mqtt/dist/mqtt"
import { useEffect, useState } from "react";
import { IMqttMessage } from "../interfaces/IMqttMessage";

export const useMqtt = (client: mqtt.MqttClient | null, subscriptions: string[]) => {

  const options: mqtt.IClientOptions = {
    protocolVersion: 5,
  };

  const [message, setMessage] = useState<IMqttMessage | null>(null);

  useEffect(() => {
    if (!client) return;

    client.on('connect', () => {
      console.log(`MQTT - Connected: ${client.options.host}`);
      // setConnected(true);
    });

    client.on('message', (topic, payload) => {
      console.log('MQTT - Message:', { topic, payload: payload.toString() });
      setMessage({ topic, payload });
    });
  }, [client])

  const connect = (broker: string, port: number = 8000) => {
    return mqtt.connect(`mqtt://${broker}:${port}`, options);
  }

  const subscribe = (topic: string): Promise<boolean> => {
    return new Promise(resolve => {
      if (!client) {
        console.error(`MQTT - Client not provided`);
        resolve(false);
        return;
      }

      if (!client.connected) {
        console.error(`MQTT - Unable to subscribe to ${topic} because client is not connected`);
        resolve(false);
        return;
      }

      const topicExist = subscriptions.find(e => e === topic);
      if (topicExist) {
        console.error(`MQTT - Already subscribed to ${topic}`);
        resolve(false);
        return;
      }

      client.subscribe(topic, (err) => {
        if (err) {
          console.error(`MQTT - Unable to subscribe: ${topic}`);
          console.error(err);
          resolve(false);
        } else {
          console.log(`MQTT - Subscribed: ${topic}`);
          resolve(true);
        }
      });
    })

  }

  const publish = (topic: string, message: string | Buffer, options?: mqtt.IClientPublishOptions) => {
    if (!client) {
      console.error(`MQTT - Client not provided`);
      return;
    }

    if (!client.connected) {
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
    message,
    connect,
    subscribe,
    publish,
  }

}
