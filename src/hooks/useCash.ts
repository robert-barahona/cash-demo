import { ILaneInfo } from '../interfaces/ILaneInfo';
import { IMqttPubMessage } from '../interfaces/IMqttPubMessage';
import { store } from '../store/store';
import { useMqtt } from './useMqtt';

export const useCash = () => {

  const mqtt = useMqtt();

  const connectMqtt = (broker: string, port: number) => {
    mqtt.connect(broker, port);
  }

  const startSubscriptions = () => {
    mqtt.subscribe(responseTokenTopic());
    mqtt.subscribe(responseCashTopic());
  }

  const requestToken = (laneInfo: ILaneInfo) => {
    const message = getRequestTokenJson(laneInfo);
    mqtt.publish(requestTokenTopic(), JSON.stringify(message), {
      properties: {
        responseTopic: responseTokenTopic(),
      }
    });
  }

  const requestDevices = () => {
    const message = getRquestDeviceJson();
    mqtt.publish(requestCashTopic(), JSON.stringify(message), {
      properties: {
        responseTopic: responseCashTopic(),
      }
    })
  }

  const getEndpoint = () => {
    const { laneInfo } = store.getState().cash;
    if (!laneInfo) return '';
    return `scox/v1/${laneInfo.retailer}/${laneInfo.storeId}/${laneInfo.uuid}`;
  }

  const requestTokenTopic = () => {
    return `${getEndpoint()}/device/client/requests`;
  }

  const responseTokenTopic = () => {
    return `${getEndpoint()}/device/client/requests/1`;
  }

  const requestCashTopic = () => {
    return `${getEndpoint()}/cash/requests`;
  }

  const responseCashTopic = () => {
    return `${getEndpoint()}/cash/requests/1`;
  }

  const getRequestTokenJson = (laneInfo: ILaneInfo) => {
    const message: IMqttPubMessage = {
      event: 'registerClient',
      params: {
        auth: {
          type: 'none',
        },
        client: {
          id: 'asdf',
        },
        source: {
          retailer: laneInfo.retailer,
          store: laneInfo.storeId,
          uuid: laneInfo.uuid,
        }
      }
    }
    return message;
  }

  const getRquestDeviceJson = () => {
    const message: IMqttPubMessage = {
      event: 'requestDevices',
      params: {
        clientToken: 'eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDU2MTA0MTksImlhdCI6MTY3NDA3NDQxOSwibmJmIjoxNjc0MDc0NDE5LCJzdWIiOiJUdXFNUTNiNCIsInJldGFpbGVyIjoiTkNSIiwic3RvcmUiOiJzdG9yZTAxIiwiZW5kcG9pbnQiOiJ0ZXJtaW5hbDAxIn0.AeUbkYjzWhBhoEYqPq3OmQ_NWjiHt26i7YAkCvEk2Y_pFNuMqZdwoko7uW_jrXBBqivylY_6GkwpYQSbdeK9L1a0AB6em5lr3BfTDINJpZzcFX-aJXlDlcsAF3TGcQKoMqCxlAdwyOpg4Wbb1q9oBF4aNnOE0NULJuJAUB3EiABkatC_'
      }
    }
    return message;
  }

  return {
    connectMqtt,
    connected: mqtt.connected,
    startSubscriptions,
    requestToken,
    requestDevices,
  }
}