# Ripple Nearby Topic Lounges

Build a mobile-first clickable prototype (390x844 iPhone frame, centered on desktop) for an iOS app called "Ripple". Frontend only, mock data, no backend. Single-page app.

Concept: a topic lounge for people in the same place (within ~200m). Not friends, not anonymous strangers: people who are here right now. Users appear only by nickname. People nearby are called "ripplers".

Visual style: Spotify-like and hip. Dark background (#0B0B0F), one vivid accent (electric lime #C6FF3D) plus a soft purple glow, bold large typography (Pretendard or Inter), generous spacing, rounded 24px cards, subtle glassmorphism, smooth micro-animations (framer-motion). All UI text in Korean.

Screens (bottom tab bar: 홈, 지난 방, 내 정보):

1. Location permission intro
   - Title: "지금 여기 있는 사람들과 이어지려면"
   - Body: "정확한 위치는 근처 약 200m 안에 누가 있는지 판단할 때만 써요. 내 위치는 약 150m 크기의 구역으로만 저장되고, 다른 사람에게는 절대 보이지 않아요."
   - Primary button "위치 허용하기", text link "나중에 할게요"
   - Small illustration of water ripples spreading from a single dot

2. Home (radar, inspired by Toss's orbit screen)
   - Center: my avatar emoji with label "나"
   - Concentric rings that feel like water ripples spreading from my avatar (soft fade-out waves every 2 seconds)
   - Blurred anonymous dots floating on the rings (no exact positions)
   - Pill above center: "주변 ripplers 12명" (if fewer than 3, show "주변 ripplers 몇 명")
   - Small chips floating on the rings: recent keyword rooms nearby like "#뉴진스", "#학식", "#해커톤"
   - Huge full-width CTA fixed at the bottom: "지금 여기 사람들과 이야기하기"
   - Secondary pill: "2명 더 모이면 라운지가 열려요" (progress style)

3. Lounge chat
   - Header: "미래백년관 라운지 · ripplers 12명"
   - Chat bubbles with nicknames (e.g. "졸린 판다", "새벽 코더")
   - A highlighted bot card in the middle of the chat: "3명이 '뉴진스' 얘기를 하고 있어요" with a lime button "#뉴진스방 입장하기"
   - Long-press on a message opens a bottom sheet: 신고하기, 차단하기
   - Input bar with send button

4. Keyword room
   - Spotify playlist-style cover card at top: big gradient cover with ripple pattern and "#뉴진스", meta "2026.11.21 14:30 · 상명대 미래백년관 · 8명"
   - Label: "이 방은 장소를 떠나도 유지돼요"
   - Chat below, share button that shows a story-sized room card preview

5. 지난 방
   - Header "이곳의 지난 방"
   - List of room cards with cover gradient, keyword, place, time, member count

6. Phone verification (mock)
   - Phone number input, 6-digit code input, button "인증하고 시작하기"
   - Small note: "상대에게는 닉네임만 보여요"

7. Settings (내 정보 tab)
   - Nickname, blocked users list, report history, contact email "help@ripple.app"

Make transitions between screens smooth. Start on screen 1, then go to Home after tapping 위치 허용하기.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/998d3af4-ab2c-5b87-90ab-234810db114c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
