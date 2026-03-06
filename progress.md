Original prompt: Отлчино, собираем игру по новой. Используй навык Develop Web Game. Концепт: Таверд дефенс с элементами рандома. волна из 20 монстров по очереди выходят из ворот (Клетка "Вход монстров) Идут по белой дорожке, поворачивая только налево (красные метки на карте) и не проходя прямо там, где красный крест. Карта прикреплена. На каждой зеленой клетке можно поставит 2 башенку. Для начала сделай 1 вариацию башенки, в дальнейшем сделаем башни 5 (Простой, Продвинутый, Экспертный, Мастер, Легенда, Божество) уровней развития, на каждом уровне кроме божества по 7 типов башен, на божественном 21 тип башни, каждая с уникальными способностями (потом проработаем каждую). Каждая башня имеет определенный тип атаки ( одна из этих: Колящая, Огненная, Ледяная, Токсичная, Атака по области) Враги имеют показатель здоровья, который растет с каждым уровнем прохождения и показатель брони, который растет с каждым уровнем. Скорость врагов не меняется. Пока давай релизуем это

TODO:
- Render PDF map and derive grid/path.
- Build initial HTML/JS game.

Update:
- Created first playable HTML/JS prototype.
- Map uses the 13x13 PDF grid with a fixed long path through the white roads.
- Added one tower variant (Простой/Шипомет/Колящая), 2 slots per green cell, enemy waves, HP/armor scaling, constant speed, render_game_to_text, and advanceTime.
- Next: run Playwright client, inspect screenshot/state, fix issues.
- Installed Playwright under the skill directory and fixed its package to ESM (type=module).
- Ran the required Playwright client once with click actions and captured output artifacts in output/web-game.

Update:
- Locked the route as-is; future gameplay changes should not alter enemy path.
- Changed tower placement to 1 tower per green cell.
- Added silver economy: normal kills grant silver equal to current wave.
- Added a bonus enemy as the 3rd spawn in each wave; its kill reward is 75 + wave * 2 silver.
- Next: rerun Playwright and verify HUD + text state.

Update:
- Added mine build mode. Mines give +2 silver at the start of each wave and expire after 2 wave payouts.
- Each wave refreshes mine stock to 2. Only placed mines generate silver.
- Added build-mode switching (A = tower, B = mine, or click the panel buttons).
- Updated Playwright actions to place a mine during setup, then a combat tower.

Update:
- Replaced single simple tower with 7 selectable simple tower types, each priced at 170 silver.
- Start silver is now 680 (enough for 4 simple towers).
- Clicking an existing mine no longer deletes it. It opens a contextual submenu with a Delete action.
- Occupied cells no longer remove combat towers on simple click.
- Next: rerun Playwright and verify mine menu + paid tower placement.

Update:
- Build mode is now only random combat tower or mine; manual tower choice was removed.
- Mines are no longer deletable by click and do not open a delete menu.
- Combat towers now open a context menu with Delete, and Upgrade when a matching pair exists.
- Added 7 simple and 7 advanced tower definitions with unique attack patterns, colors, and visuals.
- Mine stock now accumulates between waves (+2 each wave instead of resetting).

Update:
- Reworked mines into gold mines: each installed mine now produces 1 gold nugget per round, sells it immediately for a random price in the range 50 + wave*2 to 100 + wave*2, and still collapses after 2 rounds.
- Added persistent nugget accounting: total nuggets, last nugget values, and per-round mine income are tracked in state/render_game_to_text.
- Rebuilt the UI into a portrait 9:16 mobile layout: gameplay on top, stats strip above controls, info panel on the lower left, and 4 action buttons on the lower right.
- Added per-tower description/talent text in the info panel when a tower is selected.
- Added direct build modes for random simple tower (170 silver), random master tower (1500 silver), shop popup, and upgrade button.
- Upgrades now consume two identical towers and roll a random tower from the next tier pool instead of upgrading into the same family.
- Added a new master tier pool (7 towers) to support direct master builds and random upgrades from advanced towers.
- Increased Ballista range and attack speed across simple/advanced/master tiers.
- Re-ran the Playwright client and inspected the latest screenshot/state artifacts under output/web-game.

Update:
- Added board camera controls: drag-to-pan on the map, wheel zoom on desktop, and on-canvas +/- zoom buttons.
- Removed the extra rightmost build column by shrinking the map from 13 to 12 columns while preserving the fixed enemy route.
- Nugget pricing is now a single random current price per wave instead of showing the full range; mines produce nuggets only, and selling converts them to silver.
- Added shop actions: select mine build mode and sell nuggets in batches of up to 5 at the current displayed price.
- Replaced the bottom-right upgrade button with a tools button (hammer/wrench glyph). It opens tower actions: upgrade, delete, reroll (950 silver), and move (100 silver).
- Move mode allows relocating a selected combat tower to an empty build cell or swapping it with another combat tower.
- Added persistent base lives display in the top-right; each leaked enemy still removes 1 life from the starting 20.
- Re-ran Playwright after the changes and visually checked the updated portrait UI screenshot/state.

Update:
- Changed bottom controls so build is now a single "Строить" button with a separate picker for Простая/Мастер tower type.
- Added persistent build picker state (`towerBuildMode`, `buildPickerOpen`) and gold-highlight vs dimmed selection styling for the chosen build tier.
- Shop actions now stay open after use (notably repeated nugget selling), and tower tools no longer auto-close after upgrade/reroll/move actions.
- Replaced the old 3-tier tower sets with the new user-provided 5-tier roster (levels 1-5, excluding deity), including support towers and chain towers.
- Extended runtime tower data to carry the new combat properties: crit multipliers, chain falloff, aura buffs, armor penetration/break, HP-scaling damage, stuns/freezes, poison spread, and defense shred.
- Extended combat logic to support aura towers, chain attacks, splash control effects, and several of the new special mechanics.
- `node --check` passed, and the dev server is serving the updated `main.js`.
- Playwright rerun was blocked by a Chromium launch failure in this environment (`MachPortRendezvousServer ... Permission denied`), so browser automation could not be completed in this turn.

Update:
- Removed mine from the build flow: the build button now only manages simple/master tower selection; mine remains accessible via the shop.
- Added a pause button under the base life badge. It toggles a real gameplay pause (update loop halts) and opens a pause overlay.
- Added pause menu sections: resume, settings, leaderboard, and in-app transactions store placeholders.
- Added pause state to render_game_to_text so automation/manual checks can confirm whether the simulation is halted.

Update:
- Added enemy magic resistance scaling by wave brackets: 20% (1-4), 25% (5-9), 30% (10-14), 35% (15-19), 40% (20-24), 45% (25+).
- Split physical vs magical damage resolution: magical attacks now use enemy magic resist, and magic shred debuffs now reduce magic resist instead of armor.
- Removed on-canvas +/- zoom controls and desktop wheel zoom; map zoom now uses touch gestures (pinch) plus drag panning.
- Reworked pointer handling to support pinch-to-zoom and kept tap placement/select actions on single-touch taps.
- Updated the mobile shell CSS to use more of the viewport and disabled browser touch gestures on the canvas (`touch-action: none`).
- Moved nugget selling out of the shop menu and into a dedicated `Продать` button to the right of `Строить`.
- Shop popup now contains placeholder catalog content only; it stays open until its own button is toggled.
- Game-field taps no longer auto-close build/shop/tools menus; menus are now sticky and only toggle from their own buttons.
- Added gold selection highlight state to the tools menu and shop popup, matching the build picker behavior.
- Refined tower roster implementation to match the latest user stat list, including conditional current/max-HP bonus procs for relevant towers.
- `node --check` passes and the local server serves the updated `main.js`.
- Re-ran the Playwright client after this patch; Chromium still fails in this macOS sandbox with `MachPortRendezvousServer ... Permission denied`, so browser automation remains blocked by the environment rather than a new game error.
- Reinterpreted tower speed values as cooldown seconds per shot (all tower `cooldown` values now match the design list directly).
- Build picker labels now read `Башня 1 уровня` and `Башня 4 уровня`; the 1500-silver purchase now rolls from the level-4 tower pool.
- Replaced tower delete with `Продать башню`; sell values now follow the fixed per-level table.
- Added boss purchases to the shop: 3 boss buttons with costs, cooldowns, buy limits, custom stats, mine rewards on kill, and 5 castle damage on leak.
- Boss kills/leaks no longer distort the normal wave remaining counter; only regular wave enemies affect `waveKilled`/`waveEscaped`.
- Rebalanced two level-1 towers per the latest correction: `Лучник` now fires every 0.3s, `Искра` every 0.4s.
- Added enemy selection by tap on the map; selected enemies now show HP, armor, and magic resist in the left info panel.
- `render_game_to_text` now includes `selectedEnemy` and `selectedEnemyId` for non-visual validation.
- Added a dedicated aura strip between the board and the stats bar.
- Support auras are now exposed via `getAppliedAuras`, reused both for combat math and UI.
- Selected towers now show effective damage and effective cooldown with aura buffs applied, including base values in parentheses when buffed.
- Added clickable aura badges for the selected tower; tapping a badge selects that aura source and shows its effect text in the aura strip.
- Increased key UI font sizes (info panel, aura strip, stats strip buttons/menus) for better mobile readability.
- Added scrollable info-panel content with drag-to-scroll inside the left info card.
- Added start flow: first launch asks for nickname, the map is blurred behind a centered `Начать` button, and after pressing it the first wave begins after a 5-second countdown.
- Added a collapsible live damage panel (`Топ урона`) that shows the top 5 towers by current-wave damage, and falls back to the last completed wave snapshot between waves.
- Added nickname persistence via localStorage and a `Сменить ник` action in the pause menu.
- Expanded the pause menu with a `Рейтинг по раундам` section and local best-wave tracking.

Update:
- Added the attribute scaffold to combat towers: `Сила`, `Ловкость`, `Интеллект` now flow into shared helpers for damage, cooldown, and ability scaling.
- Replaced the tower data pools with the new attribute-based roster and added a full level-6 (`MYTHIC_TOWERS`) pool.
- Extended runtime tower instances with missing special fields (`rangeCellsAura`, nova chance, pulse stun params) so the new tower definitions are actually usable in combat.
- Rewrote `updateTowers()` to use the new effective-stat helpers instead of the old base-only math; support towers now attack and apply auras at the same time.
- Wired in approximations for level-6 mechanics: execute, beam proc, area stuns, temporary haste bursts, every-Nth empowered shots, global blasts, silver splash, all-target fire, and devourer-style scaling aura.
- Updated the info panel so selected towers show their attribute and effective damage/cooldown with aura buffs applied, instead of the outdated base-only values.
- `node --check` passes; Playwright rerun was attempted but still fails in this environment because Chromium cannot launch (`MachPortRendezvousServer ... Permission denied`).
- Next: visually verify the new level-6 proc balance on a real device/browser and, if needed, attribute DOT kill credit back to the source tower for more accurate damage stats.

Update:
- Added random build-upgrades for level-1 construction: simple builds now roll 1% into level 4, 3% into level 3, 5% into level 2, otherwise level 1, while still charging the level-1 build price.
- Moved the wave/silver/nugget HUD into a top overlay strip and integrated pause + castle lives into that same top bar.
- Reused the former bottom stats strip as a 9-slot inventory row above the controls.
- Added item inventory state and the first item: `Таинственный мешок`.
- Mystery bags are awarded when the upcoming wave number is divisible by 5.
- Activating a mystery bag opens a 3-choice popup: spawn a random reward tower, add +20% global tower damage for the run, or add +30% to nugget sale value for the run.
- Nugget sale UI and selling logic now use the boosted sale price (`getAdjustedNuggetPrice`) instead of the raw base roll.
- `node --check` passes after the patch.

Update:
- Changed aura geometry: buffs now apply when the aura circle intersects the target tower's cell square, not only when the target tower center is inside the aura radius.
- This matches the design rule that clipping the tower's tile is enough for the aura to affect it.
- Self-buffing is still blocked: the source tower does not count its own cell for its own aura.

Update:
- Added a persistent local leaderboard stored in localStorage (`td_random_leaderboard`) keyed by nickname and best cleared wave.
- Nickname changes and best-wave updates now sync into that leaderboard automatically.
- Removed the old `Рейтинг по раундам` pause-menu entry.
- Replaced the previous placeholder leaderboard copy with a real rendered top list in the pause menu.
- Increased pause-menu button heights and enlarged title, button, and panel text for better mobile readability.

Update:
- Increased late-game difficulty: enemy HP and armor now ramp faster after wave 5.
- Nugget price is now hard-capped at 160 silver.
- Normal creep reward now caps at 30 silver.
- Added endless mode after wave 30: waves no longer break, enemies spawn continuously, and each spawned endless creep increments an `extraWave` progression counter used for scaling stats.
- Added `extraKills` tracking; endless kills now update the local leaderboard and the leaderboard sorts by extra kills first, then best wave.
- New mine stock no longer increases after wave 30.
- Top HUD now switches its first stat slot to the extra-kill counter in endless mode.

Update:
- Started the level-6 item system patch: added a random item purchase flow, inventory-backed items, level-6 tower item slots, item transfer, item selling, and item-based combat effects/aura effects.
- Fixed critical runtime issues in that patch: tower items now reference unique tower instance IDs instead of shared tower-family IDs, so transfers between duplicate tower types no longer target the wrong tower.
- Fixed the inventory renderer to resolve all item definitions through the shared item registry (`ITEM_BY_ID`) instead of the old mystery-bag-only map.
- Fixed `render_game_to_text` by restoring the missing `selectedItemDef` binding and exposing tower `instanceId` in the text payload.
- Hardened item transfer so selecting a tower's own equipped item and tapping that same tower no longer destroys or falsely upgrades the item.
- Extended ability scaling so all-damage and magic-damage auras/items also affect ability damage, not just the base attack hit.
- `node --check` passes after the fixes; required Playwright client was run again but still fails in this environment because Chromium cannot launch (`MachPortRendezvousServer ... Permission denied`).
- Next: manual device validation for the new item flow (buy item -> inspect item -> equip on level-6 tower -> merge two level-1 identical items -> sell item from inventory/tower).

Update:
- Replaced the purely local leaderboard behavior with a hybrid model: local cache + Netlify-backed shared leaderboard.
- Added `netlify/functions/leaderboard.js` using Netlify Blobs as the shared storage layer.
- Added `package.json` with `@netlify/blobs` dependency so Netlify can bundle the function.
- Frontend now uses a stable `playerKey` (Telegram user id when available, nickname fallback), submits updates to the Netlify function, and fetches the shared top list when the leaderboard screen opens and on startup.
- Local storage remains as a fallback cache when the remote endpoint is unavailable.
- `node --check` passes for both `main.js` and `netlify/functions/leaderboard.js`.

Update:
- Replaced the old pre-start blur/button overlay with a real top-level menu that opens on first load (`mainMenuOpen = true`).
- The menu now provides: start/continue, leaderboard, nickname, settings, and tutorial.
- Pause now reuses the same menu shell; the primary button label switches from `Начать игру` before the first run to `Продолжить` after the run has started.
- Added a guided tutorial flow: intro modal (`Монстры уже идут...`), highlighted `Строить` button, forced selection of the 170-silver tower, highlighted placement cell, then a mine reminder with the build button highlighted again.
- The old start overlay now only shows the 5-second countdown for normal starts; the old darkened pre-start blocker is gone.
- `render_game_to_text` now exposes `mainMenuOpen` and `tutorial` state for validation.
- `node --check` passes.
- Local server on port 8091 was restarted for manual verification; browser automation artifacts did not refresh in this environment, so UI was validated by served-source checks rather than a fresh Playwright screenshot.

Update:
- Expanded the tutorial into a timed step machine: it now gates enemy movement until the user presses `Далее`, pauses after 2 seconds to force `Строить`, pauses again to force `Башня 1 уровня`, highlights one of the central build cells, resumes after tower placement, then pauses again after 5 seconds to force mine placement.
- After mine placement, the tutorial resumes with an extra-tower hint. The next two simple towers are forced to match so the player can see the upgrade pattern; after the second matching tower, the game pauses and points at `Действия`.
- When wave 2 actually starts, the tutorial pauses again, highlights the nugget/price HUD and `Продать`, then pauses once more after selling to point at `Магазин`.
- Tutorial highlighting now supports specific build-picker items, tools, shop, and the sell flow; blinking uses wall-clock time so it remains animated while the game is paused.

Update:
- Split tutorial/script pauses from the visible pause menu by adding `pauseMenuOpen`.
- `paused` now only means simulation is halted; `pauseMenuOpen` now controls whether the pause menu overlay is rendered.
- Result: tutorial-controlled pauses no longer open the pause menu, while the top-left pause button still opens the menu and pauses the game normally.

Update:
- Fixed tutorial pause step visibility: `highlight_build` now has its own modal text (`Нажми кнопку «Строить»`), so the scripted stop after the initial delay no longer looks empty.
- Build picker now closes immediately after choosing any build option (`Башня 1 уровня`, `Башня 4 уровня`, `Шахта`). This applies generally, not only in tutorial; shop remains sticky as before.
- Tutorial mine placement now targets lower central build cells instead of reusing the first central tower slots.
- Added scroll support for tutorial text modals: long tutorial copy is clipped inside the modal body and can be dragged vertically to read the full text.

Update:
- Refined the experimental UI build (`main-ui-test.js`): shop/tools submenu buttons are taller with larger text, each now has an explicit `X` close button, and the build submenu is now vertical.
- The experimental floating info panel now shows a compact ability/effect line for towers and item effects for selected items.

Update:
- Promoted the experimental floating-info + horizontal-button UI from `main-ui-test.js` into the main build by copying it over `main.js`.
- Close buttons in shop/tools popups now render a drawn cross icon instead of the letter `X`.

Update:
- Increased the bottom action-row button height and replaced text labels with icon glyphs (hammer, pickaxe, coins, cart, wrench) in the promoted main UI.
- Kept only compact numeric sublabels where needed (mine stock, sell amount/price) and added a tier badge on the build button.
- Synced the same UI change into main-ui-test.js.
- node --check passes for both files; Playwright rerun still fails in this environment because Chromium cannot launch (MachPortRendezvousServer permission error).

Update:
- Replaced the canvas-drawn action button symbols with imported PNG icons from assets/ui (hammer, pickaxe, coins, basket, tools) using drawImage with aspect-ratio fit.
- Kept the old vector glyphs as a fallback if an icon fails to load.
- Synced the same image-based button UI into main-ui-test.js.
- node --check passes; Playwright rerun still fails here because Chromium cannot launch (MachPortRendezvousServer permission error).

Update:
- Fixed Vercel leaderboard API so Supabase writes now preserve the maximum of bestWave and bestExtraKills instead of overwriting with the latest submitted values.
- This prevents later low-value submits (for example 0 extra kills on a new session start) from erasing a previously higher endless run.

Update:
- Leaderboard identity now keeps a history of legacy nick-based keys on the client and submits them with each remote leaderboard POST.
- Vercel leaderboard API now merges legacy nick rows into the current player key (preferably tg:<id>), preserves the maximum bestWave/bestExtraKills, updates the current nickname, and deletes stale legacy rows.
- Result: changing nickname under the same Telegram account updates the same leaderboard record instead of losing the record or leaving old duplicate rows behind.

Update:
- Added level-6 tower sprite loading from /assets/towers/level6/*.png in the main build and the test build.
- drawTowerSprite now first tries a loaded PNG by towerId and falls back to the existing procedural tower graphics if the image is missing or not loaded yet.
- node --check passes; Playwright rerun still fails in this environment because Chromium cannot launch (MachPortRendezvousServer permission error).

Update:
- Reworked the floating info panel: larger footprint, more transparent background, stronger contrast, larger text, larger tower item slot, and a close button with a drawn cross.
- Info panel now only opens when tapping a tower, enemy, or item; it no longer opens for mines or auto-opens after buying an item.
- Added real scroll support inside the info panel (drag inside the panel scrolls content instead of panning the board).
- Regular item info now uses the info panel with an inline sell button; mystery bag choices remain in their popup.
- Inventory item labels now use case by item level (level 1 lower-case, level 2 upper-case).
- Added cache-busting versioning to level 6 tower sprite URLs so replaced lighter PNGs reload in the browser.
- Synced main-ui-test.js from main.js.
- Ran node --check successfully for both main.js and main-ui-test.js.
- Attempted the required Playwright client run, but Chromium still fails in this environment with MachPortRendezvousServer permission errors.

Update:
- Rebalanced two level-1 towers.
- Archer changed to 0.4s cooldown and 14 base damage.
- Stonethrower changed to 1.0s cooldown and 2.5-cell splash radius.

Update:
- Rebalanced one level-5 tower.
- Небесный шторм changed to 0.65s cooldown and 190 base damage.

Update:
- Nerfed level-1 Time Pendulum to 15% proc chance and 0.5s stun.
- Applied the pending level-4 balance adjustments: Stardrop all-target chance reduced to 30%, Lightning Lord base damage reduced to 120.
- Reworked aura logic so self-auras now apply to the source tower and identical tower/item aura families no longer stack.
- Added timed rounds: normal waves now run on a 60s timer with a skip button after a full clear, while wave 30 transitions into endless mode only after a 5s post-clear delay.
- Reduced base enemy movement speed by 5%, added extra-wave speed/magic/physical resistance thresholds, and made wave 30 auto-cash out any remaining mine durability.
- Reworked the aura HUD from text pills into icon badges with tap-to-read details in the aura strip, and made defeat open the menu with a restart action.
- Ran the required Playwright client again after the change set, but Chromium still cannot launch in this environment (`MachPortRendezvousServer ... Permission denied`), so validation remained limited to syntax checks and served-JS inspection.

Update:
- Moved active round/start timers into a dedicated pill above the top HUD and reduced round duration from 60s to 50s.
- Skip button now pulses when a cleared wave can be skipped.
- Reduced the river to one lane and expanded the inventory to 12 slots laid out as 2 rows of 6 with larger cells.
- Tightened random build odds for 170-silver and 1500-silver tower purchases.
- Synced main-ui-test.js with main.js after these UI/probability changes.

Update:
- Reduced inventory slot size by 25% (72 -> 54) and tightened the inventory strip height to match.

Update:
- Reduced the aura strip height and resized aura badges to 40px (roughly 3/4 of the 54px inventory slots).

Update:
- Added global attribute upgrade purchases in the shop (+1 to matching towers, cost 500, capped at 20).
- Reworked the shop into grouped square buttons (attributes, bosses, item) and raised the popup higher.
- Enlarged the tools menu buttons, reordered them to Upgrade / Move / Reroll / Sell, with yellow reroll and red sell styling.

Update:
- Tower info panel now shows the tower's attribute and current attribute level with color coding: strength red, agility green, intellect blue.
- Replaced tier text in tower info with an explicit `Уровень N` line based on the runtime tower level, so rerolls/upgrades always display the correct level.
- Added permanent level accent rings around tower models for levels 1-5 (gray, green, cyan, purple, orange) to make tower levels more obvious on the board.
- Critical shots are now rendered with a brighter glow, thicker beam, and an impact flash to stand out from normal attacks.
- Synced the same changes into main-ui-test.js.
- `node --check` passed; Playwright rerun failed again due the existing Chromium MachPort permission crash in this environment.

Update:
- Fixed menu click-through: added popup-layer hit testing for Build picker, Shop, Tools, and Item popup backgrounds so taps on popup empty space are consumed and no longer pass through to the map/board.
- Added helper rect functions: getBuildPickerRect/getItemMenuRect/getShopPopupRect/getToolsPopupRect and unified isPointInOverlayPopup(point).
- Updated handleTap to return early when tap is inside an open overlay popup background.
- Updated pointerdown board gating to treat overlay popups as non-board area, preventing accidental camera drag/pan through menu overlays.
- Synced changes into main-ui-test.js.
- node --check passed; Playwright rerun attempted and failed with the known Chromium MachPort permission crash in this environment.

Update:
- Added a global cap for tower attack radius: `MAX_TOWER_ATTACK_RANGE_CELLS = 5`.
- Applied cap at tower instantiation (`createTower`): any tower with configured attack range above 5 now attacks at 5 cells.
- Aura radius remains independent and is not clamped by this change.
- Synced change into main-ui-test.js.

Update:
- Switched mine visuals to image sprite loading from `/assets/towers/mine.png` with cache-busting query (`MINE_SPRITE_VERSION`).
- Added `drawMineSprite` and wired mine rendering to use image first; legacy geometric mine drawing remains as fallback when image is unavailable.
- Synced changes into main-ui-test.js.

Update:
- Fixed tap reliability for UI controls by capturing pointer input on `pointerdown` (`setPointerCapture`) and releasing on `pointerup`/`pointercancel`, so button taps are no longer dropped when the finger drifts outside the canvas before release.
- Tap actions now resolve by initial touch coordinates (`startClientX/startClientY`) instead of release coordinates, improving hit consistency for action/menu buttons (including `Апгрейд`, `Переместить`, `Продать`).
- Switched drag-threshold measurement to client-space pixels and increased tap-to-drag threshold from 6 to 9 px for more stable mobile taps.
- Fixed item-transfer lock: pressing `X` on the floating info panel now exits transfer mode via `clearItemSelection()` (not just hiding the panel).
- Synced `main-ui-test.js` with `main.js` and re-ran syntax checks (`node --check`) successfully.
- Playwright loop could not be re-run in this sandbox because local HTTP bind is blocked (`PermissionError: [Errno 1] Operation not permitted`).

Update:
- Rebalanced endless buffs in `spawnEnemy()`:
  - Extra monsters now gain `magicResist = 90%` starting at extra wave 250 (was 99% at 500).
  - Extra monsters now gain `physicalResist = 90%` starting at extra wave 500 (was 99% at 850).
  - Extra monsters now gain speed boost `x1.25` starting at extra wave 850 (was 250).
- Increased bonus (gold) creep reward scaling:
  - Formula changed to `75 + wave * 35` (using progression wave) for the 3rd creep in normal waves.
- Increased size/readability of Mystery Bag action buttons:
  - Larger popup, larger button height (42), larger fonts, and adjusted vertical placement to fit the new layout.
- Synced `main-ui-test.js` from `main.js` and validated syntax with `node --check`.

Update:
- Added a new pause/menu button: `Энциклопедия`.
- Implemented encyclopedia panel with two tabs: `Башни` and `Предметы`.
- Built both encyclopedia lists dynamically from runtime data sources:
  - Towers from `ALL_TOWERS`.
  - Items from `ITEM_DEFS`.
  This keeps encyclopedia content automatically aligned with future balance/content edits.
- `Башни` tab now renders per-tower entries with:
  - visual tower icon/sprite,
  - tier/attack type,
  - attribute + attribute level,
  - damage, cooldown, range,
  - detailed skill/ability text (generated via tower ability description logic).
- `Предметы` tab now renders per-item entries with:
  - item icon,
  - level/sell value metadata,
  - full effect description.
- Added vertical scroll support for encyclopedia content via pointer drag inside the list area.
- Added tab click handling inside menu (`Башни`/`Предметы`) with scroll reset on tab switch.
- Refactored pause menu geometry into shared helpers (`getPauseMenuLayout`, `getPauseInfoRect`) and reused it for encyclopedia hitboxes/rendering.
- Synced `main-ui-test.js` with `main.js`; syntax checks pass (`node --check`).
- Follow-up fix: while menu overlays are open (including Encyclopedia), board drag/pan is now blocked to prevent accidental map movement during menu scrolling.
- Attempted required Playwright run (`web_game_playwright_client.js`), but Chromium launch still fails in this environment with `MachPortRendezvousServer ... Permission denied`.

Update:
- Adjusted splash radii on two level-6 towers:
  - `КОЛОСС`: `splashRadiusCells` 3.0 -> 2.0
  - `ЗВЁЗДНЫЙ СУД`: `splashRadiusCells` 2.5 -> 2.0
- Synced `main-ui-test.js` and validated syntax (`node --check`).

Update:
- Updated level-6 splash radii:
  - `КОЛОСС`: 2.0
  - `ЗВЁЗДНЫЙ СУД`: 2.0
- Updated item tuning per latest spec:
  - `Излучатель энергии` / `Продвинутый излучатель энергии`: aura radius changed to 4.5.
  - `Сфера порчи` descriptions updated to reflect monster incoming-damage amplification (phys+mag); effect remains implemented through shared damage aura scaling.
- Added two new item pairs:
  - `Молот правосудия` / `Зачарованный молот правосудия`.
  - `Меч ярости` / `Окровавленный меч ярости`.
- Added combat logic for new items:
  - Justice hammer proc: physical splash around primary target (radius 2 cells), damage = tower attack damage + attribute*scale.
  - Rage sword proc: armor-piercing physical crit hit on primary target (x3/x6 from item tier), with dedicated shot feedback.
- Added helper `dealArmorPiercingPhysicalHit()` for physical hits that bypass armor (still affected by physical resistance modifiers).
- Added mystery bag shop stock mechanic:
  - New constants: `MYSTERY_BAG_COST = 500`, `MYSTERY_BAG_SHOP_LIMIT = 30`.
  - New state counter: `mysteryBagsBought`.
  - New shop action/button: `buy_bag` with remaining stock display (`N шт` / `лимит`).
  - Buying disabled once stock reaches 30.
- Encyclopedia items tab now uses `ITEM_BY_ID` (shows all current shop items + base items), keeping encyclopedia synchronized with balance/content changes.
- Synced `main-ui-test.js` with `main.js`; syntax checks pass (`node --check`).

Update:
- Level 6 tower role conversion applied per request:
  - ЖНЕЦ ДУШ and НЕБЕСНЫЙ АРХОНТ: attribute changed to Сила, base attack changed to Физическая/Физическая по области.
  - ЗВЁЗДНЫЙ СУД and Маленькая, но сильная: attribute changed to Ловкость, base attack changed to Физическая/Физическая по области.
- Added `abilityAttackType` handling so special procs can use a separate damage school from base attacks.
  - For towers with `abilityAttackType: "Магическая"`, beam/map proc/map blast now apply magical damage while basic shots remain physical.
- Synced the same changes in `main-ui-test.js` so test/main logic stay aligned.
- Validation:
  - `node --check main.js` passed.
  - `node --check main-ui-test.js` passed.
  - Playwright run attempted via develop-web-game skill client, but Chromium launch failed in this environment (`MachPortRendezvousServer ... Permission denied`).

Update:
- Introduced external balance data sources and generation pipeline:
  - `data/towers.balance.json`
  - `data/items.balance.json`
  - `data/waves.balance.json`
  - generated runtime bundle `data/balance-config.js`
- Added tooling scripts:
  - `scripts/generate-balance-json.mjs` (extracts current balance data from `main.js` into JSON files)
  - `scripts/build-balance-config.mjs` (builds `window.TD_BALANCE_CONFIG` bundle from JSON)
  - package scripts:
    - `npm run sync:balance`
    - `npm run build:balance`
- Updated HTML entrypoints to load external balance bundle before game logic:
  - `index.html`
  - `index-ui-test.html`
- Refactored `main.js` to read balance from config (with safe fallbacks) without touching core combat mechanics:
  - tower costs / wave constants / economy constants now sourced from `WAVE_CONSTANTS`
  - boss defs and sell values configurable from `waves.balance.json`
  - tower per-id balance overrides applied from `towers.balance.json`
  - item per-id balance overrides applied from `items.balance.json`
  - moved wave formulas into config-driven objects:
    - wave hp/armor growth
    - wave magic resist brackets
    - nugget price formula
    - regular/bonus creep silver rewards
    - endless thresholds and modifiers
    - random roll chances (build rolls, bag rolls, shop tier-2 item chance)
  - replaced hardcoded wave-threshold literals (`30`, `250`, `500`, `850`) in core flow with config-driven values.
- Synced `main-ui-test.js` from updated `main.js`.
- Validation:
  - `node --check main.js` passed
  - `node --check main-ui-test.js` passed
  - `npm run sync:balance` passed
  - Playwright run attempted via develop-web-game skill, but Chromium launch is blocked in this environment (`MachPortRendezvousServer ... Permission denied`).

TODO / next:
- If you change any JSON in `data/*.balance.json`, run `npm run build:balance` (or `npm run sync:balance`) before deploy.
- Consider adding a CI check that regenerates `data/balance-config.js` and fails if it is out of sync with JSON.

Update:
- Performance optimization pass for iPhone heat/battery issues:
  - Added hard frame cap to 60 FPS (`TARGET_FPS`, `FRAME_TIME_MS`) in main loop.
  - Added render skip on hidden tab and conditional continuous rendering (`shouldRenderContinuously`) to avoid drawing static frames repeatedly.
  - Removed all Canvas shadow blur/glow usage (`shadowBlur`/`shadowColor`) to cut GPU-heavy effects.
  - Implemented background render cache (offscreen canvas): gradient/page/frame now rendered once and reused.
  - Implemented static board render cache (offscreen canvas): grid/roads/turn markers/map labels/river rendered once and reused each frame.
  - Runtime board rendering now draws cached static layer + dynamic entities only (selection, towers, shots, enemies, hover).
- Synced `main-ui-test.js` from optimized `main.js`.
- Validation:
  - `node --check main.js` passed.
  - `node --check main-ui-test.js` passed.
  - Playwright run attempted and still blocked in this environment by Chromium launch permissions (`MachPortRendezvousServer ... Permission denied`).

Update:
- Added encyclopedia and leaderboard as dedicated full-screen pause overlays:
  - `Энциклопедия` now opens a full-screen panel with top tabs (`Башни` / `Предметы`), a large scrollable content area, and a fixed bottom `Назад` button.
  - `Таблица лидеров` now opens a separate full-screen panel with a scrollable leaderboard list and a fixed bottom `Назад` button.
- Added separate leaderboard scroll state/pointer handling (`leaderboardScroll`, `leaderboardScrollMax`) so drag scrolling works inside leaderboard content.
- Updated pause-menu hit-testing so full-screen overlays block underlying menu/map clicks; only tab buttons and `Назад` are actionable there.
- Synced `main-ui-test.js` from `main.js`.
- Validation:
  - `node --check main.js` passed.
  - `node --check main-ui-test.js` passed.
  - Playwright run attempted via `develop-web-game` client, but still blocked by this environment’s Chromium launch restriction (`MachPortRendezvousServer ... Permission denied`).

Update:
- Test-only map skinning implemented in `/Users/chibir/Documents/TDRandom/main-ui-test.js`.
- Added map tile loading for grass (variants 1-3), road, water, and portal from `/assets/tiles/...`.
- Replaced static board coloring with tile-based rendering:
  - green build cells now use deterministic mix of `grass_1..3`;
  - road cells use `road_1`;
  - water row uses `water_1` tiled by cell;
  - spawn portal cell (`START_CELL`) now uses `portal_1` sprite.
- Kept all gameplay logic unchanged and did not modify `main.js`.
- Validation: `node --check main-ui-test.js` passed.

Update:
- Fixed portal in test build to be animated instead of static image:
  - portal tile source switched to the actual existing file path (`portal_1 (фон удален).png`, URL-encoded);
  - portal is now drawn in dynamic board pass (`drawAnimatedPortal`) with time-based pulse/glow/particles;
  - static cache no longer bakes portal image, so animation is visible every frame.
- Updated bag economy logic in both `main.js` and `main-ui-test.js`:
  - shop `buy_bag` now means **item bag** (random item), with hard shop limit of 30;
  - mystery bags are no longer sold in shop;
  - mystery bags now drop only every 5 waves and at most 6 times per run.
- Validation: `node --check main.js` and `node --check main-ui-test.js` passed.

Update:
- Removed portal tile/animation from test build (`main-ui-test.js`) per request; map now uses only grass/road/water tiles.
- Ported tile-based map skin from test to main game (`main.js`):
  - build cells use mixed grass tiles 1-3,
  - road uses road tile,
  - water row uses water tile.
- Kept mystery bag/shop split logic in both builds:
  - shop sells item bags (limit 30),
  - mystery bags drop every 5 waves up to 6 total.
- Validation: `node --check main.js` and `node --check main-ui-test.js` passed.

Update:
- Endgame mine cashout moved from wave 30 start to endless transition moment (when first extra wave starts after countdown).
- Tower tuning updates (main + ui-test):
  - `Абсолютный холод`: renamed, removed splash pattern, freeze chance reduced to 2%.
  - `Небесный шторм`: renamed, removed crit and magic-resist shred.
- Validation: `node --check main.js` and `node --check main-ui-test.js` passed.

Update:
- Connected level-1 tower sprite assets to base build (`main.js`) via `TOWER_SPRITE_PATHS`.
- Added mappings:
  - peasant -> assets/towers/level1/peasant.png
  - archer -> assets/towers/level1/archer.png
  - stonethrower -> assets/towers/level1/catapult.png
  - frost_turret -> assets/towers/level1/frozentower.png
  - cactus -> assets/towers/level1/cactus.png
  - spark -> assets/towers/level1/lightning.png
  - banner -> assets/towers/level1/banner.png
- Kept existing level-6 mappings unchanged.
- Validation: `node --check main.js` passed.

Update:
- Increased level-1 tower sprite render scale by 2x in both main and ui-test builds.
- Implemented in `drawTowerImageSprite`: `tierScale = 2` for `tower.level === 1`.
- Validation: `node --check main.js` and `node --check main-ui-test.js` passed.

Update:
- Increased level-1 sprite scale further by +10% (2.0 -> 2.2) in both main and ui-test builds.
- Validation: `node --check main.js` and `node --check main-ui-test.js` passed.

Update:
- Added one-time camera zoom hint at game start (main + ui-test): map auto-zooms to 1.2x and returns to 1.0x to demonstrate pinch/zoom capability.
- Implemented as `cameraZoomHint` state with smooth sine pulse over ~1.3s.
- Hint starts on normal game start and is cancelled immediately if player touches the board.
- Validation: `node --check main.js` and `node --check main-ui-test.js` passed.
