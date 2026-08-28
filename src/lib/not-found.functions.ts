import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";

export const markNotFound = createServerFn({ method: "GET" }).handler(
  async () => {
    setResponseStatus(404);
    return null;
  },
);
