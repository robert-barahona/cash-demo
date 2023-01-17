export interface IMqttMessage {
  topic: string;
  payload: Buffer;
}