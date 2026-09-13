# Woodland art direction

Four deliberately different profiles retain every existing tree anchor, scale,
rotation, culling bucket, forest boundary and river geometry:

- Mirkwood: mixed silhouettes, more spires in the northern portion and spreading
  crowns farther south. The precise mixture and transition are illustrative,
  not a botanical survey or a claim about a canonical boundary.
- Fangorn: broad, old crowns and rooted trunks instead of a predominantly
  conifer-like silhouette.
- Lórien: a dedicated pale-trunked mallorn symbol with a layered golden crown.
- Old Forest: predominantly bent, spreading trees with low companion crowns.

These are original SVG drawings, not AI raster replacements or traced artwork.
Gold is the atlas's seasonal convention, not a claim that mallorn leaves are
golden year-round. See [Mallorn](https://tolkiengateway.net/wiki/Mallorn), which
references *The Fellowship of the Ring*, “Lothlórien”, for silver bark and
seasonal foliage. The [Fangorn](https://tolkiengateway.net/wiki/Fangorn_Forest)
and [Mirkwood](https://tolkiengateway.net/wiki/Mirkwood) articles provide broader
setting context; the exact visual recipes remain editorial.

Run `bun scripts/refine-woodland.mjs --write` to apply the deterministic profiles;
run without `--write` to check them. The command changes symbol references only
and identifies the four existing leading forest groups. If their ordering is
changed, update the profile mapping before regeneration.

This pass does not redraw mountain ranges or invent new clearings. Geographic
changes belong in the separate regional audit, not in decorative refinements.
