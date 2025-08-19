import axios, { HttpStatusCode } from 'axios';
import { Stream, StreamFormData } from '../interfaces/stream';

const ENDPOINT = `http://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/streams`;

export async function getAllActiveStream(): Promise<Stream[] | undefined> {
  try {
    const response = await axios.get(`${ENDPOINT}/all-active-stream`);
    if (response.status !== HttpStatusCode.Ok) {
      return undefined;
    }

    return response.data.data;
  } catch (error) {
    return undefined;
  }
}

export async function getStreamByStreamerID(hostPrincipalId: string) {
  try {
    const response = await axios.get(`${ENDPOINT}/by-streamer-id?streamerID=${hostPrincipalId}`);
    if (response.status !== HttpStatusCode.Ok) {
      return undefined;
    }

    return response.data.data;
  } catch (error) {
    return undefined;
  }

}

export async function createStream(payload: StreamFormData) {
  try {
    const res = await axios.post(`${ENDPOINT}/create-stream`, payload);
    if (
      res.status !== HttpStatusCode.Ok &&
      res.status !== HttpStatusCode.Created
    )
      return undefined;
    return res.data?.data;
  } catch {
    return undefined;
  }
}
