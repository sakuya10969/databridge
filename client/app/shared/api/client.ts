import axios, { type AxiosError } from "axios";
import type { ErrorResponse } from "./types";

export const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ErrorResponse>) => {
    const message =
      error.response?.data?.error?.message ?? error.message ?? "Unknown error";
    return Promise.reject(new Error(message));
  }
);
