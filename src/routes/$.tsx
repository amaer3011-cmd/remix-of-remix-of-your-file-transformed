import { createFileRoute } from "@tanstack/react-router";

import { NotFoundPage, notFoundMeta } from "@/components/NotFoundPage";

export const Route = createFileRoute("/$")({
  loader: async () => {
    if (typeof window === "undefined") {
      const { setResponseStatus } = await import("@tanstack/react-start/server");
      setResponseStatus(404);
    }
    return null;
  },
  head: () => ({ meta: notFoundMeta }),
  component: NotFoundPage,
  errorComponent: NotFoundPage,
  notFoundComponent: NotFoundPage,
});
