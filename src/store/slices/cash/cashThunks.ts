import { Dispatch } from "@reduxjs/toolkit"
import { JARVIS_NCR_URL } from "../../../constants/url";
import { ApiHelper } from "../../../helpers/ApiHelper"
import { cashActions } from "./cashSlice";

const getConfig = (): any =>
  async (dispatch: Dispatch) => {

    const { error, response } = await ApiHelper.get(`${JARVIS_NCR_URL}/configservice/configuration/deviceserver`);

    if (error) {
      console.error(error);
      return;
    }

    dispatch(cashActions.setConfig(response.common));

  }

const getLaneInfo = (): any =>
  async (dispatch: Dispatch) => {

    const { error, response } = await ApiHelper.get('http://localhost:4000/v1/signal/store/lane-info');

    if (error) {
      console.error(error);
      return;
    }

    dispatch(cashActions.setLaneInfo(response));

  }

export const cashThunks = {
  getConfig,
  getLaneInfo,
}