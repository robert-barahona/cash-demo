import { MqttClient } from 'mqtt/dist/mqtt';
import { useEffect, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { ILaneInfo } from '../interfaces/ILaneInfo';
import { IMqttPubMessage } from '../interfaces/IMqttPubMessage';
import { ICashState, cashActions } from '../store/slices/cash/cashSlice';
import { useMqtt } from './useMqtt';
import { IMqttMessage } from '../interfaces/IMqttMessage';
import { IMqttRespMessage } from '../interfaces/IMqttRespMessage';
import { cashThunks } from '../store/slices/cash/cashThunks';

let cashMqttClient: MqttClient | null = null;

export const useCash = () => {

  const dispatch = useDispatch();

  const accessToken = useSelector((state: any) => (state.cash as ICashState).accessToken);
  const laneInfo = useSelector((state: any) => (state.cash as ICashState).laneInfo);
  const config = useSelector((state: any) => (state.cash as ICashState).config);
  const mqttSubscriptions = useSelector((state: any) => (state.cash as ICashState).mqttSubscriptions);

  const [mqttClient, setMqttClient] = useState<MqttClient | null>(cashMqttClient);
  const [initialized, setInitialized] = useState(false);

  const mqtt = useMqtt(mqttClient, mqttSubscriptions);

  useEffect(() => {
    if (!initialized) return
    dispatch(cashThunks.getConfig());
    dispatch(cashThunks.getLaneInfo());
  }, [initialized])

  useEffect(() => {
    if (!initialized) return;
    if (config?.broker_host_external && !mqttClient && !mqtt.connected) {
      connectMqtt();
    }
  }, [initialized, config, mqttClient, mqtt.connected])

  useEffect(() => {
    if (!initialized) return;
    if (laneInfo && mqtt.connected) {
      startSubscriptions();
    }
  }, [initialized, laneInfo, mqtt.connected])

  useEffect(() => {
    if (!initialized) return;
    const subscribedToResponse = mqttSubscriptions.find(e => e === responseTokenTopic());
    if (subscribedToResponse && !accessToken && laneInfo) {
      requestToken(laneInfo);
    }
  }, [initialized, mqttSubscriptions, accessToken, laneInfo])

  useEffect(() => {
    if (!initialized) return;
    if (mqtt.message) {
      handleMessages(mqtt.message);
    }
  }, [initialized, mqtt.message])


  const getEndpoint = () => {
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

  const initializeCashServices = () => {
    setInitialized(true);
  }

  const connectMqtt = () => {
    cashMqttClient = mqtt.startConnection(
      config.broker_host_external,
      config.broker_port_external_websockets ?? 8000
    );
    setMqttClient(cashMqttClient);
  }

  const startSubscriptions = async () => {
    const tokenTopic = responseTokenTopic();
    const cashTopic = responseCashTopic();
    const tokenSubscribed = await mqtt.subscribe(tokenTopic);
    const cashSubscribed = await mqtt.subscribe(cashTopic);
    batch(() => {
      tokenSubscribed && dispatch(cashActions.addMqttSubscription(tokenTopic));
      cashSubscribed && dispatch(cashActions.addMqttSubscription(cashTopic));
    })
  }

  const handleMessages = (message: IMqttMessage) => {
    const { payload, topic } = message;

    if (topic === responseTokenTopic()) {
      const payloadJson: IMqttRespMessage = JSON.parse(payload.toString());
      const { event, response } = payloadJson;
      if (event === 'registerClient' && response.result === 'success') {
        dispatch(cashActions.setAccessToken(response.accessToken));
        requestDevices(response.accessToken);
      }
    }
  }

  const requestToken = (laneInfo: ILaneInfo) => {
    const message = getRequestTokenJson(laneInfo);
    mqtt.publish(requestTokenTopic(), JSON.stringify(message), {
      properties: {
        responseTopic: responseTokenTopic(),
      }
    });
  }

  const requestDevices = (token?: string) => {
    const message = getRquestDeviceJson(token);
    mqtt.publish(requestCashTopic(), JSON.stringify(message), {
      properties: {
        responseTopic: responseCashTopic(),
      }
    })
  }

  const releaseDevices = () => {
    const message = getReleaseDeviceJson();
    mqtt.publish(requestCashTopic(), JSON.stringify(message), {
      properties: {
        responseTopic: responseCashTopic(),
      }
    })
  }

  const getRequestTokenJson = (laneInfo: ILaneInfo) => {
    const message: IMqttPubMessage = {
      event: 'registerClient',
      params: {
        auth: {
          type: 'none',
        },
        client: {
          id: `${(new Date()).toISOString()}`,
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

  const getRquestDeviceJson = (token?: string) => {
    const message: IMqttPubMessage = {
      event: 'requestDevices',
      params: {
        clientToken: token ?? accessToken,
      }
    }
    return message;
  }

  const getReleaseDeviceJson = () => {
    const message: IMqttPubMessage = {
      event: 'releaseDevices',
      params: {
        clientToken: accessToken,
      }
    }
    return message;
  }

  return {
    connected: mqtt.connected,
    initializeCashServices,
    releaseDevices,
  }

}