import axios, { AxiosResponse } from "axios";

interface IStatus {
  error: string | null;
  response: any;
}

export class ApiHelper {

  private static service = axios.create({
    timeout: 10 * 1000,
  });

  static post = async (url: string, options?: { body?: any, token?: any, params?: any }): Promise<IStatus> => {

    const apiBase = 'http://jarvis.ncr.com';

    try {

      console.log('POST - URL', url);
      console.log('BODY', options?.body);

      let res: AxiosResponse<any, any>;

      if (!options) {

        res = await this.service.post(`${apiBase}${url}`);

      } else {

        const { body, token, params } = options;
        res = await this.service.post(`${apiBase}${url}`, body, {
          params,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

      }

      if (!res.data) {
        return {
          error: this.getError(res),
          response: null,
        };
      }

      return {
        response: res.data.value,
        error: null,
      }

    } catch (error) {

      return {
        error: this.getError(error),
        response: null,
      }

    }

  }

  static get = async (url: string, options?: { token?: any, params?: any }): Promise<IStatus> => {

    const apiBase = 'http://jarvis.ncr.com';

    try {

      console.log('GET - URL', url);

      let res: AxiosResponse<any, any>;

      if (!options) {

        res = await this.service.get(`${apiBase}${url}`);

      } else {

        const { token, params } = options;
        res = await this.service.get(`${apiBase}${url}`, {
          params,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

      }

      if (!res.data) {
        return {
          error: this.getError(res),
          response: null,
        };
      }

      return {
        response: res.data.value,
        error: null,
      }

    } catch (error) {

      return {
        error: this.getError(error),
        response: null,
      }

    }

  }

  private static getError = (error: any): string => {

    if (error.response?.status) {
      return this.getErrorByStatus(error.response.status) ?? error.message;
    }

    if (error.code) {
      return this.getErrorByCode(error.code);
    }

    return error.message ?? 'Error no identificado';
  }

  private static getErrorByStatus = (status: number) => {
    switch (status) {
      case 400:
        return 'ERROR_400';
      case 401:
        return 'ERROR_401';
      case 403:
        return 'ERROR_403';
      case 404:
        return 'ERROR_404';
      case 500:
        return 'ERROR_500';
      case 503:
        return 'ERROR_503';
      default:
        return null;
    }
  }

  private static getErrorByCode = (code: string) => {
    switch (code) {
      case 'ERR_NETWORK':
        return 'ERROR_NETWORK';
      case 'ECONNABORTED':
        return 'ERROR_ECONNABORTED';
      default:
        return `Error: ${code}`;
    }
  }
}