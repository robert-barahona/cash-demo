import { MqttClient } from 'mqtt/dist/mqtt';
import { useEffect, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { ILaneInfo } from '../interfaces/ILaneInfo';
import { IMqttPubMessage } from '../interfaces/IMqttPubMessage';
import { ICashState, cashActions } from '../store/slices/cash/cashSlice';
import { useMqtt } from './useMqtt';
import { IMqttMessage } from '../interfaces/IMqttMessage';
import { cashThunks } from '../store/slices/cash/cashThunks';

let cashMqttClient: MqttClient | null = null;

export const useCash = () => {

  const dispatch = useDispatch();

  const accessToken = useSelector((state: any) => (state.cash as ICashState).accessToken);
  const laneInfo = useSelector((state: any) => (state.cash as ICashState).laneInfo);
  const config = useSelector((state: any) => (state.cash as ICashState).config);
  const mqttSubscriptions = useSelector((state: any) => (state.cash as ICashState).mqttSubscriptions);
  const sessionId = useSelector((state: any) => (state.cash as ICashState).sessionId);

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

  useEffect(() => {
    if (!initialized) return;
    if (accessToken) {
      const sessionTopic = responseSessionTopic();
      mqtt.subscribe(sessionTopic).then(() => {
        dispatch(cashActions.addMqttSubscription(sessionTopic));
      });
    }
  }, [initialized, accessToken])

  const getEndpoint = () => {
    if (!laneInfo) return '';
    return `scox/v1/${laneInfo.retailer}/${laneInfo.storeId}/${laneInfo.uuid}`;
  }

  const responseSessionTopic = () => {
    return `${getEndpoint()}/cash/session/events`;
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

  const responseCashTopic = (session?: string) => {
    session = !session?.trim() ? undefined : session;
    return `${getEndpoint()}/cash/requests/${session ?? sessionId ?? 1}`;
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

  const startSubscriptions = () => {
    const tokenTopic = responseTokenTopic();
    const cashTopic = responseCashTopic();
    batch(() => {
      mqtt.subscribe(tokenTopic).then(() => {
        dispatch(cashActions.addMqttSubscription(tokenTopic));
      });
      mqtt.subscribe(cashTopic).then(() => {
        dispatch(cashActions.addMqttSubscription(cashTopic));
      });
    })
  }

  const handleMessages = (message: IMqttMessage) => {
    const { payload, topic, packet } = message;
    const payloadJson = JSON.parse(payload.toString());
    const { event, response, sessionID, params } = payloadJson;

    if (topic === responseTokenTopic()) {
      if (event === 'registerClient' && response.result === 'success') {
        dispatch(cashActions.setAccessToken(response.accessToken));
      }
    }

    if (topic === responseSessionTopic()) {
      if (event === 'sessionStart') {
        if (packet.retain && !!params.sessionID) {
          setSession(params.sessionID);
        }
      }
      if (event === 'sessionEnd') {
        if (packet.retain) {
          requestDevices();
        }
      }
    }

    if (topic === responseCashTopic()) {
      if (event === 'requestDevices') {
        if (!!response.error) {
          console.error('Error en requestDevices', response.error);
        }
        if (response.result === 'success' && !!sessionID) {
          setSession(sessionID);
        }
      }
      if (event === 'releaseDevices' || event === 'disableAcceptors') {
        if (response.result === 'success') {
          removeSession(sessionID);
        }
      }
    }
  }

  const setSession = (sessionID: string) => {
    const newTopic = responseCashTopic(sessionID);
    batch(async () => {
      dispatch(cashActions.setSessionId(sessionID));
      mqtt.subscribe(newTopic).then(() => {
        dispatch(cashActions.addMqttSubscription(newTopic));
      });
    })
  }

  const removeSession = (sessionID: string) => {
    const currentTopic = responseCashTopic(sessionID);
    batch(() => {
      dispatch(cashActions.setSessionId(null));
      mqtt.unsubscribe(currentTopic).then(() => {
        dispatch(cashActions.removeMqttSubscription(currentTopic));
      });
    })
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

  const getRquestDeviceJson = () => {
    const message: IMqttPubMessage = {
      event: 'requestDevices',
      params: {
        clientToken: accessToken,
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