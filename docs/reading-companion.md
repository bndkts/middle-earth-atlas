# Reading companion

The chapter picker remembers the most recently opened valid chapter and the
optional story-detail guard in local storage (`mea:reading`). It stores no
account or server-side progress. Explicit chapter deep links override the saved
chapter. “Forget progress” clears the record and returns to the atlas. Storage
failure is non-fatal; preferences then last only for the current page.

The optional guard applies **only while chapter mode is open**:

- Omit all chapter summaries and replace later chapter titles with “Unread chapter”.
- Keep the current chapter title, its locations and character names visible.
- Disable search, categories, timeline, journey controls and random discovery.
- Block full place stories opened from map labels; hide battle markers,
  decorative story discoveries and existing journey/direction overlays.
- Restore normal controls and overlays when leaving chapter mode.

This is not a promise of an entirely spoiler-free map: geographical names remain
visible, and selecting a later chapter deliberately reveals its title and cast.
Outside chapter mode, place guides and the atlas retain their full content.
The UI explains this boundary before the reader relies on the guard.

Character colours are deterministic and supplemented by written names, never
used as the sole identifier. Close numbered pins get small display offsets with
dashed tethers to their real map anchors. These offsets do not alter geographic
data. The usual warning still applies: locations belong to moments **within** a
chapter, not necessarily to a simultaneous scene.

Automated policy tests cover invalid stored state, guarded titles, stable colours
and non-overlapping display pins. Browser verification covers guard toggling,
navigation, resuming, reload, forgetting, and mobile pin separation.
