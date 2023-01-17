import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ILaneInfo } from '../../../interfaces/ILaneInfo';

export interface ICashState {
  config: any | null;
  laneInfo: ILaneInfo | null;
}

const initialState: ICashState = {
  config: null,
  laneInfo: null,
}

export const cashSlice = createSlice({
  name: 'cash',
  initialState: initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<any>) => {
      state.config = action.payload;
    },
    setLaneInfo: (state, action: PayloadAction<ILaneInfo | null>) => {
      state.laneInfo = action.payload;
    }
  },
})

export const cashActions = cashSlice.actions

export const cashReducer = cashSlice.reducer