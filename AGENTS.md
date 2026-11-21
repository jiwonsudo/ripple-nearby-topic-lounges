<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Keep this clickable prototype frontend-only; appearance preferences are shared React state, so every screen updates without a backend.
- Define theme, story-cover, motion, and chat typography roles in global CSS; chat size options live in the browser-safe appearance module for consistent settings and previews.
- Map mock topic photos by keyword in a browser-safe module and reuse their CDN asset pointers across room covers, lists, and story previews; this keeps a topic's visual identity consistent.
- Mount one Three.js water surface after hydration and pre-render it invisibly during permission without a frame loop; reuse that canvas on home entry, animate only on home, and dispose GPU resources on other screens to keep SSR safe and mobile rendering bounded.
- Render the pool floor/count through the existing water shader; its single frame loop dispatches throttled pool frames and touch-wave ages to bounded top-view character motion, so riders and water react together without another frame loop.
- Constrain home swimmer SVGs separately from editor previews and reject non-finite swimmer coordinates before shader upload so delayed layout cannot enlarge avatars or corrupt water.
- Pointer-captured swimmer grabs pause that body's integration; release injects bounded velocity and a drop event into the existing water loop rather than adding another animation loop.
- Integrate persistent character velocities with water drag, one impulse per wave and wall reflection; never spring characters back to seeded positions, and render local wakes in the water shader instead of stretched DOM rings.
- Keep pool gear in the shared typed avatar; reuse tube/prop geometry across separate full-body and overhead renders, and show strokes only without a tube so editor, home and chat identities agree.
- Split worn tubes into back/front geometry around connected bodies, use one eyewear field with transparent masks, and allocate distinct mock tube colors excluding the shared self color so accessories remain legible.
- Show a bounded startup splash until the pre-rendered water is ready (or the timeout expires); preserve that canvas through permission so startup cannot hang on unavailable graphics.
- Use the origin-aware wave only for room entry; explicit room returns use a gentle directional crossfade even when the destination is a lounge, and reduced-motion users bypass the wave.
- Portal sheets into the phone shell rather than animated screen layers so their backdrop and content stay above navigation without escaping the phone frame.
- Keep avatar choices in typed browser-safe data with token-colored SVG rendering; a draft editor commits to shared React state so profile and chat use the same character without photos or backend storage.
- Anchor chat characters absolutely to full-width message rows and clip them at the scroll viewport edges; use mirrored outward-extending torso paths for peek poses and reserve a separate bubble gutter so character shape cannot affect text layout.
- Use browser View Transitions for theme changes with a button-origin circular reveal of the fully recolored screen, except the chat settings switch changes shared theme directly; unsupported browsers and reduced-motion preferences also change theme directly.
- Permission logo and animated ripples share the same fixed-size anchor; position the wave origin at the logo asset's splash center (50%, 70.3125%) rather than offsetting separate page layers.
- Character SVGs declare intrinsic dimensions, token-based paint attributes and their own peek clip so delayed CSS cannot produce oversized black silhouettes or leak torso geometry across messages.
- Identify topic rooms by stable creation IDs and keep joined rooms plus per-room messages in app-level React state; creation metadata stays unchanged across re-entry and same-keyword rooms remain distinct.
- Reply gestures use horizontal pointer intent while preserving vertical scrolling; sent replies retain an original-message reference and quoted snapshot for re-entry.
- Keep prototype identity, moderation records and first-entry room nicknames in shared React state; immutable user IDs key messages, reports and blocks, while room nickname snapshots never follow later profile edits.
- Validate nicknames through the browser-safe identity module and reuse its adjective-animal generator; the same validation gates manual and randomized saves.
- Keep joined-room swipe handling in RoomListItem: left reveals a confirmed leave action, right reveals notification toggles, and vertical gestures remain scrolling; leaving removes membership but preserves first-entry nickname snapshots.
