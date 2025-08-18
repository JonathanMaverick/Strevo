import axios, { HttpStatusCode } from "axios";
import { Stream } from "../interfaces/stream";

const ENDPOINT = `http://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/streams`;

export async function getAllActiveStream(): Promise<Stream[] | undefined> {
    try {
        const response = await axios.get(`${ENDPOINT}/all-active-stream`);
        if (response.status !== HttpStatusCode.Ok) {
            return undefined;
        }

        return response.data.data;
    }
    catch (error) {
        return undefined;
    }

}