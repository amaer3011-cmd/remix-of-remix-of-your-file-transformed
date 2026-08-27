import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { studymateResponse } from "../lib/studymate-page";

export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () => studymateResponse("/"),
    },
  },
});
