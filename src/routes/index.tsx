import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import studymateHtml from "../studymate.html?raw";

export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () =>
        new Response(studymateHtml, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=0, must-revalidate",
          },
        }),
    },
  },
});
