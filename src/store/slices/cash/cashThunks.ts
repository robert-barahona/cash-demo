import { Dispatch } from "@reduxjs/toolkit"
import { ApiHelper } from "../../../helpers/ApiHelper"
import { cashActions } from "./cashSlice";

const getConfig = (): any =>
  async (dispatch: Dispatch) => {

    const { error, response } = await ApiHelper.get('/configservice/configuration/deviceserver');

    if (error) {
      console.error(error);
      return;
    }

    console.log(response.common);
    dispatch(cashActions.setConfig(response.common));

  }

export const cashThunks = {
  getConfig,
}