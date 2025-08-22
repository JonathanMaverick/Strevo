import axios, { HttpStatusCode } from 'axios';
import { Highlight } from '../interfaces/highlight';

const ENDPOINT = `http://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/highlight`;
export async function getByStreamerId(
  principalId: string,
): Promise<Highlight[] | undefined> {
  try {
    const res = await axios.get(
      `${ENDPOINT}/by-streamer-id?streamerID=${principalId}`,
    );
    console.log(res);
    if (res.status !== HttpStatusCode.Ok) return undefined;

    const arr = res.data?.data?.highlights as Highlight[] | undefined;
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return undefined;
  }
}
