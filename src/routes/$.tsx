import { createFileRoute } from "@tanstack/react-router";

import { NotFoundPage, notFoundMeta } from "@/components/NotFoundPage";
import { notFoundResponse } from "@/lib/not-found-page";

export const Route = createFileRoute("/$")({
  server: {
    handlers: {
      GET: () => notFoundResponse(),
    },
  },
  head: () => ({ meta: notFoundMeta }),
  component: NotFoundPage,
  errorComponent: NotFoundPage,
  notFoundComponent: NotFoundPage,
});
