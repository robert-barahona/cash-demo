import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { cashReducer } from "./slices/cash/cashSlice";

const combinedReducers = combineReducers({
  cash: cashReducer,
});

export const store = configureStore({
  reducer: combinedReducers,
});