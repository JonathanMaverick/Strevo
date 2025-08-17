import axios, { HttpStatusCode } from "axios";

export async function getAllStreamHistory(principalId: string) {
    try {
        const response = await axios.get(`http://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/stream-history/all-stream?hostPrincipalID=${principalId}`);
        console.log('response is ', response.status)
        if (response.status !== HttpStatusCode.Ok) {
            return undefined;
        }

        return response.data.data;
    }
    catch (error) {
        return undefined;
    }
}

export async function getStreamHistoryById(streamHistoryId: string) {
    try {
        const response = await axios.get(`http://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/stream-history/by-id?streamHistoryID=${streamHistoryId}`);
        if (response.status !== HttpStatusCode.Ok) {
            return undefined;
        }

        return response.data.data;
    }
    catch (error) {
        return undefined;
    }
}