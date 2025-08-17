import axios, { HttpStatusCode } from "axios";

export async function getStreamHistory(principalId: string) {
    try {
        const response = await axios.get(`http://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/stream-history/all-stream?hostPrincipalID=${principalId}`);
        if (response.status !== HttpStatusCode.Ok) {
            return undefined;
        }

        return response.data.data;
    }
    catch (error) {
        return undefined;
    }
}