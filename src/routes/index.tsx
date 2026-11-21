import { createFileRoute } from "@tanstack/react-router";
import { RippleApp } from "@/components/ripple/RippleApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ripple — 지금 여기 사람들과 이야기하기" },
      { name: "description", content: "근처 200m 안의 ripplers와 키워드로 이어지는 토픽 라운지 프로토타입." },
      { property: "og:title", content: "Ripple — 지금 여기 사람들과 이야기하기" },
      { property: "og:description", content: "근처 200m 안의 ripplers와 키워드로 이어지는 토픽 라운지." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RippleApp,
});
