import { IPublishPacket } from "mqtt/dist/mqtt";

export interface IMqttMessage {
  topic: string;
  payload: Buffer;
  packet: IPublishPacket;
}