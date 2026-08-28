import { createFileRoute } from "@tanstack/react-router";

import { NotFoundPage, notFoundMeta } from "@/components/NotFoundPage";
import { markNotFound } from "@/lib/not-found.functions";

export const Route = createFileRoute("/$")({
  loader: async () => {
    await markNotFound();
    return null;
  },
  head: () => ({ meta: notFoundMeta }),
  component: NotFoundPage,
  errorComponent: NotFoundPage,
  notFoundComponent: NotFoundPage,
});
