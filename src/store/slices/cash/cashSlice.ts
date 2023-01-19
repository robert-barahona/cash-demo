import { MqttClient } from "mqtt/dist/mqtt"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ILaneInfo } from '../../../interfaces/ILaneInfo';

export interface ICashState {
  accessToken: string | null;
  config: any | null;
  laneInfo: ILaneInfo | null;
  mqttClient: MqttClient | null;
  mqttSubscriptions: string[];
}

const initialState: ICashState = {
  accessToken: null,
  config: null,
  laneInfo: null,
  mqttClient: null,
  mqttSubscriptions: [],
}

export const cashSlice = createSlice({
  name: 'cash',
  initialState: initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    setConfig: (state, action: PayloadAction<any>) => {
      state.config = action.payload;
    },
    setLaneInfo: (state, action: PayloadAction<ILaneInfo | null>) => {
      state.laneInfo = action.payload;
    },
    setMqttClient: (state, action: PayloadAction<MqttClient | null>) => {
      state.mqttClient = action.payload;
    },
    addMqttSubscription: (state, action: PayloadAction<string>) => {
      state.mqttSubscriptions.push(action.payload);
    },
    removeMqttSubscription: (state, action: PayloadAction<string>) => {
      state.mqttSubscriptions = state.mqttSubscriptions.filter(e => e !== action.payload);
    },
  },
})

export const cashActions = cashSlice.actions

export const cashReducer = cashSlice.reducer