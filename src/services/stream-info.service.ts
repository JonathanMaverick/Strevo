import axios, { HttpStatusCode } from 'axios';
import { StreamInfo } from '../interfaces/stream-info';

const ENDPOINT = `http://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/stream-info`;
export async function getStreamInfo(
  hostPrincipalID: string,
): Promise<StreamInfo | undefined> {
  try {
    const response = await axios.get(`${ENDPOINT}/${hostPrincipalID}`);
    if (response.status !== HttpStatusCode.Ok) {
      return undefined;
    }

    return response.data.data;
  } catch (error) {
    return undefined;
  }
}

export async function saveStreamInfo(
  streamInfo: StreamInfo,
): Promise<boolean | undefined> {
  try {
    const response = await axios.put(`${ENDPOINT}`, streamInfo);
    if (response.status !== HttpStatusCode.NoContent) {
      return undefined;
    }

    return true;
  } catch (error) {
    return undefined;
  }
}
