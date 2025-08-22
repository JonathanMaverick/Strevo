import axios, { HttpStatusCode } from 'axios';

const ENDPOINT = `http://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/viewer-history`;
export async function createViewerHistory(
  principalId: string,
  streamHistoryId: string,
) {
  try {
    const response = await axios.post(`${ENDPOINT}/create`, {
      viewerHistoryPrincipalID: principalId,
      viewerHistoryStreamHistoryID: streamHistoryId,
    });
    if (response.status !== HttpStatusCode.Ok) {
      return undefined;
    }

    return response.data.data;
  } catch (error) {
    return undefined;
  }
}
