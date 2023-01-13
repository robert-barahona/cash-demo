import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ICashState {
  config: any;
}

const initialState: ICashState = {
  config: {},
}

export const cashSlice = createSlice({
  name: 'cash',
  initialState: initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<any>) => {
      state.config = action.payload;
    },
  },
})

export const cashActions = cashSlice.actions

export const cashReducer = cashSlice.reducer