import { connect, MqttClient, IClientOptions, IClientPublishOptions } from "mqtt/dist/mqtt"
import { useEffect, useState } from "react";
import { IMqttMessage } from "../interfaces/IMqttMessage";

export const useMqtt = (client: MqttClient | null, subscriptions: string[]) => {

  const options: IClientOptions = {
    protocolVersion: 5,
  };

  const [message, setMessage] = useState<IMqttMessage | null>(null);
  const [connected, setConnected] = useState(client?.connected ?? false);

  useEffect(() => {
    if (!client) return;

    if (client.listenerCount('connect') === 1) {
      client.on('connect', () => {
        console.log(`MQTT - Connected: ${client.options.host}`);
        setConnected(true);
      });
    }

    if (client.listenerCount('disconnect') === 0) {
      client.on('disconnect', () => {
        console.log(`MQTT - Connected: ${client.options.host}`);
        setConnected(false);
      });
    }

    if (client.listenerCount('message') === 0) {
      client.on('message', (topic, payload) => {
        console.log('MQTT - Message:', { topic, payload: payload.toString() });
        setMessage({ topic, payload });
      });
    }
  }, [client])

  const startConnection = (broker: string, port: number = 8000) => {
    if (client?.connected) {
      console.error('MQTT - Client already connected');
      return client;
    }
    return connect(`mqtt://${broker}:${port}`, options);
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

  const unsubscribe = (topic: string) => {
    return new Promise(resolve => {
      if (!client) {
        console.error(`MQTT - Client not provided`);
        resolve(false);
        return;
      }

      client.unsubscribe(topic, {}, (err) => {
        if (err) {
          console.error(`MQTT - Unable to unsubscribe: ${topic}`);
          console.error(err);
          resolve(false);
        } else {
          console.log(`MQTT - Unsubscribed: ${topic}`);
          resolve(true);
        }
      });
    })
  }

  const publish = (topic: string, message: string | Buffer, options?: IClientPublishOptions) => {
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
    connected,
    message,
    publish,
    startConnection,
    subscribe,
    unsubscribe,
  }

}
