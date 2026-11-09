# Page-turn animation fix and sticker system

This commit adds an `isAnimating` guard to prevent double-click jank on page turns, replaces the bouncy cubic-bezier with a smoother ease, extends the timeout to 640 ms to match the CSS animation duration, and introduces a full sticker system: a `STICKERS` constant, CSS for draggable sticker elements and a picker UI, `renderStickers`/`attachStickerDragHandlers`/`buildStickerPicker` functions, sticker persistence via `DiaryState.save()`, and a migration in `DiaryState.load()` to backfill `stickers: []` on existing memories.

Watch for:
- **Sticker position is page-relative, not memory-relative** — stickers drift from their memory when the memory is drag-repositioned (confirmed).
- **640ms timeout vs 650ms CSS duration** — 10ms window where `isAnimating` clears before the animation ends; harmless today but fragile if `renderSpread` becomes async (confirmed).
- **Sticker picker toggle can't deselect** — `forEach` clears `selected` before `toggle`, so re-clicking a selected sticker re-selects it instead of deselecting (confirmed).
- **Flip classes never explicitly removed** — discarded implicitly via `innerHTML` replacement; correct today, fragile if `renderSpread` ever becomes incremental (confirmed).

**Verdict**: APPROVED

---

## High-level view

The `isAnimating` flag is declared at module scope and set/cleared symmetrically in both turn handlers. The CSS animation duration is `0.65s`; the `setTimeout` fires at `640ms` — 10 ms early. `isAnimating` clears while the animation is still in its last frame, but `renderSpread()` runs immediately before the clear and replaces the DOM, so there is nothing to interact with during that window. Flip class cleanup is handled by `spreadEl.innerHTML = html` discarding the old page elements.

Sticker DOM elements are absolute children of `.page-left`/`.page-right`, not of the individual `.memory-item`. This means stickers travel with the page correctly during turns, but they don't follow when a memory is drag-repositioned via `applyOffsets`. A sticker placed beside a memory will appear detached after the memory is moved.

In `saveEdit`, the new sticker is pushed onto `memory.stickers` directly before calling `DiaryState.editMemory(memId, {date, time, title, text, notes})`. Since `stickers` is not in the updates object, `Object.assign` leaves it alone, and the subsequent `this.save()` inside `editMemory` persists the full memory including the pushed sticker. The ordering is correct but the two-step mutation breaks silently if a future caller includes `stickers` in the `editMemory` updates.

`buildStickerPicker` first removes `selected` from all siblings, then calls `classList.toggle('selected')` on the clicked span. Because the sibling loop runs over all options including the clicked one, a re-click removes `selected` and then `toggle` immediately re-adds it — making deselection impossible.

`renderSpread`, `renderPageMemories`, `renderMemoryItem`, `applyOffsets`, and `attachDragHandlers` are structurally unchanged. Node's `--check` parser reports no syntax errors in the 34,764-character inline script.

---

<details>
<summary>Issues (3)</summary>

1. **Sticker position is page-relative, not memory-relative** — stickers are appended to `.page-left/.page-right` with `left/top %` relative to the page container. When a memory is drag-repositioned (`applyOffsets` applies CSS `translate` to the `.memory-item`), the sticker stays at its original page coordinate and appears detached. Fix: append sticker elements to their `.memory-item[data-mem-id]` instead, storing coordinates relative to that element.

2. **Sticker picker deselect is broken** — `buildStickerPicker`'s click handler calls `container.querySelectorAll('.sticker-option').forEach(o => o.classList.remove('selected'))` before `span.classList.toggle('selected')`. The `forEach` includes the clicked span, so it removes `selected` first; `toggle` then adds it back unconditionally. The "click again to deselect" hint in the UI is false. Fix: replace the `forEach`+`toggle` pattern with a conditional: if already selected, remove; otherwise, clear others and select.

3. **640ms timeout vs 650ms animation** — `isAnimating = false` fires 10ms before the CSS animation ends. `renderSpread` runs synchronously before the clear and replaces the DOM, so there is nothing to click during the window. This becomes a real race if `renderSpread` is ever deferred or made async. Fix: align the timeout to `650ms` or `660ms`.

</details>

<details>
<summary>Details</summary>

### `isAnimating` guard — set, cleared, and scoped correctly

`isAnimating` is declared at the top of the inline script as `let isAnimating = false`. Both handlers check it on entry and return early if true. Both set it to `true` before queuing the `setTimeout` and clear it inside the callback after `renderSpread()`. There is no path where it can be stuck `true` — `renderSpread` is synchronous and the callback always completes. The cubic-bezier is updated to `(0.4,0,0.2,1)` on all three animation classes, replacing the overshoot curve `(0.68,-0.55,0.265,1.55)` that caused the jitter.

### Sticker-position drift from memory drag offsets

Sticker elements are appended to the `.page-left` or `.page-right` element found via `memEl.closest('.page-left, .page-right')`. `applyOffsets` repositions `.memory-item` elements using CSS `translate` — the sticker is a sibling of the memory on the page, not a child, so it stays at its page-relative coordinate while the memory moves. A sticker placed corner-to-corner with its memory will appear detached after the user repositions the memory.

### Sticker picker toggle logic

On click, `buildStickerPicker` removes `selected` from all options via `forEach` (including the clicked one), then calls `classList.toggle('selected')`. Because `selected` was just removed, `toggle` always adds it — making the picker single-select only, with no way to deselect. The UI hint says "click again to deselect" which is incorrect.

### Sticker save fragility in `saveEdit`

The sticker push onto `memory.stickers` happens before `DiaryState.editMemory(memId, {date, time, title, text, notes})`. The updates object deliberately omits `stickers`, so `Object.assign` preserves the push. This is correct today. Adding `stickers` to a future `editMemory` call would silently overwrite it. A safer pattern is to pass sticker mutations through `editMemory` explicitly or to call `DiaryState.save()` directly after the push instead of relying on the `editMemory` side-effect.

</details>

---

<details>
<summary>File map</summary>

- `diary.html` — all changes in this single file: CSS animation curves, paper texture gradient, sticker CSS, inline JS for `isAnimating` guard, `STICKERS` constant, `renderStickers`, `attachStickerDragHandlers`, `buildStickerPicker`, sticker init in `DiaryState.load` migration and `addMemory`, sticker picker in add/edit modals, sticker push in `saveEdit`.

Full diff: `git diff HEAD~1 -- diary.html`

</details>
