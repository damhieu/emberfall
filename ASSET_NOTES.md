# Emberfall — assets and workflow

Dream Loop source: https://github.com/achimala/dream-loop

Installed skill revision: `9bddb901f7d071cfefdd21e264267c757177a9df`. Plus workflow was selected from the account plan; user explicitly approved retaining the current orchestrator model. Three implementation rounds with fresh worker agents; root gameplay tests and independent visual critic assessments are separate.

## Asset sourcing

No Fal API credentials were available. This was disclosed before using the Plus workflow's procedural geometry fallback. No third-party 3D models were downloaded. Stone albedo and normal textures were generated using the built-in Imagegen tool, not an external API fallback.

- `assets/stone.png`: generated stone albedo, used on masonry and flagstones.
- `assets/stone-normal.png`: generated tangent-space normal texture derived from the albedo.
- `assets/mountains.png`: generated distant mountain-and-sky panorama, used behind the playable 3D scene.
- `.dream-loop/target.png`: generated visual target; working review material, not a gameplay background.

## Generation prompts

### Target

Create a visually impressive but achievable real in-engine screenshot of a small Three.js browser 3D game called EMBERFALL. Landscape 16:9. Isometric oblique camera overlooking a ruined mountain courtyard at blue hour. Playable scene clearly readable, small cloaked traveler carrying an amber lantern in foreground center, five tiny golden floating ember collectibles distributed through the courtyard, dark wandering wraiths with subtle blue eyes. Main focal point: beautifully carved monumental ancient stone arch gate at far center with faint amber rune insets, broken arched colonnades on the sides, rubble and sparse grass edges. Wet dark stone paving with warm light reflections in puddles. Layered distant misty mountain silhouettes against cold slate teal sky. Warm brass gold lantern pools contrasting cool indigo shadows. Detailed stylized realistic PBR stone, beveled modular masonry, strong silhouettes and believable game geometry, atmospheric depth, gentle particles. Camera sees entire bounded navigable courtyard with open paths. Refined minimal UI: small top left EMBERFALL, top center Gather the five embers, upper right 0 / 5; discreet lantern light bar lower left, small circular pulse button lower right. High-quality real-time indie fantasy game screenshot, not painting, no photographic camera, no splash art, no huge text overlay. All architectural forms buildable with mesh geometry. Strong art direction, readable medium values, dramatic but never underexposed.

### Stone

Game material texture asset, square 1024x1024. Seamless tileable dark weathered medieval grey blue sandstone surface suitable for the carved ruined courtyard and wet stone paving of Emberfall. Orthographic straight-on scan, flat even diffuse neutral lighting with NO baked directional light or shadows, no perspective. Highly detailed tactile stone grain, irregular fine cracks, small worn areas and tiny traces of dark moss. Mostly medium grey with subtle blue slate and taupe variation, no large objects, no text. This is an albedo/base color texture to wrap 3D masonry blocks and paving slabs, not a scene picture. Realistic physically based game material.

### Normal map (reference: stone.png)

Convert the provided stone base-color material texture into its matching tangent-space normal map for a 3D game. Preserve the same exact crack layout and stone surface at the same framing. Output ONLY a square seamless normal map image, predominantly neutral purple blue RGB (128,128,255) on flat surfaces, with correctly encoded subtle raised stone grain and recessed cracks using red and green direction channels. Fine shallow relief not dramatic lumps. No diffuse color, no text, no legend, no lighting, no grayscale, no perspective.

### Mountains

Create a wide 2:1 panoramic distant environment backdrop texture for Emberfall, a real-time dark fantasy 3D game. ONLY distant scenery, NO foreground, NO courtyard, NO characters, NO text or interface. A brooding blue-hour mountain valley with layered jagged dark slate rock peaks, conifer-covered lower slopes and thin silver-blue valley mist, cloudy navy sky across top third, one tiny ancient castle silhouette with a few amber lit windows far away on right mountain ridge. View from a high ruined terrace looking out at distant mountains. Immense spatial depth with darkest mountains near lower edges, progressively paler misty silhouettes far away. Natural irregular cliffs with rich rock detail and a readable skyline. Moody realistic game-environment matte, cool desaturated blue-grey palette, soft moonlight, atmospheric and beautiful but not bright daylight, no huge foreground polygons, no isolated floating trees. Bottom 20 percent fades into dark navy mist. Intended to wrap behind a live 3D courtyard as a background environment texture.
