import * as mqtt from "mqtt"
let mqttClient: mqtt.MqttClient;

export class MqttHelper {
  static connect = (broker: string) => {
    mqttClient = mqtt.connect(`tcp://${broker}`);
    return mqttClient;
  }
}


