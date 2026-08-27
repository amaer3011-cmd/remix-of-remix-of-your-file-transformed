import { createFileRoute } from "@tanstack/react-router";

import { NotFoundPage, notFoundMeta } from "@/components/NotFoundPage";

export const Route = createFileRoute("/$")({
  head: () => ({ meta: notFoundMeta }),
  component: NotFoundPage,
});
