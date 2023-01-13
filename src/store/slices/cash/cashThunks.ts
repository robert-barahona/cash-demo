import { Dispatch } from "@reduxjs/toolkit"
import { ApiHelper } from "../../../helpers/ApiHelper"

const getConfig = (): any =>
  async (dispatch: Dispatch) => {

    const { error, response } = await ApiHelper.get('/configservice/configuration/deviceserver');

    console.log(response);

    if (error) {
      console.error(error);
      return;
    }

    dispatch(response.common);

  }

export const cashThunks = {
  getConfig,
}