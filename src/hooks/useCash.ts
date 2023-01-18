import { store } from '../store/store';

export const useCash = () => {

  const getEndpoint = () => {
    const { laneInfo } = store.getState().cash;
    if (!laneInfo) return '';
    return `scox/v1/${laneInfo.retailer}/${laneInfo.storeId}/${laneInfo.uuid}`;
  }

  return {
    getEndpoint,
  }
}