import * as mqtt from "mqtt/dist/mqtt"
let mqttClient: mqtt.MqttClient;

const options: mqtt.IClientOptions = {
protocol: "ws",
}

export class MqttHelper {
  static connect = (broker: string, port: number) => {
    mqttClient = mqtt.connect(`mqtt://${broker}:${port}`, options);
    return mqttClient;
  }
}


