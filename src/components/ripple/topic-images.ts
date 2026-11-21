import music from "@/assets/topics/music.jpg.asset.json";
import food from "@/assets/topics/food.jpg.asset.json";
import hackathon from "@/assets/topics/hackathon.jpg.asset.json";
import exams from "@/assets/topics/exams.jpg.asset.json";
import festival from "@/assets/topics/festival.jpg.asset.json";

export const topicImages: Record<string, { url: string; alt: string }> = {
  "#뉴진스": { url: music.url, alt: "음악을 듣는 헤드폰" },
  "#학식": { url: food.url, alt: "한 끼 식사" },
  "#해커톤": { url: hackathon.url, alt: "노트북으로 함께 작업하는 팀" },
  "#중간고사": { url: exams.url, alt: "노트에 정리하며 공부하는 모습" },
  "#축제라인업": { url: festival.url, alt: "공연 무대와 관객" },
};