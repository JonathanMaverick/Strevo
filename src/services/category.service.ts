import axios, { HttpStatusCode } from 'axios';

export interface Category {
  categoryID: string;
  categoryName: string;
}

const ENDPOINT = `http://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/category`;

export async function getAllCategory(): Promise<Category[] | undefined> {
  try {
    const res = await axios.get(`${ENDPOINT}/get-all-category`);
    if (res.status !== HttpStatusCode.Ok) return undefined;
    return res.data?.data as Category[];
  } catch {
    return undefined;
  }
}

export async function createCategory(input: {
  categoryName: string;
}): Promise<Category | undefined> {
  try {
    const res = await axios.post(`${ENDPOINT}/create-category`, input);
    if (
      res.status !== HttpStatusCode.Ok &&
      res.status !== HttpStatusCode.Created
    ) {
      return undefined;
    }
    return res.data?.data as Category;
  } catch {
    return undefined;
  }
}
