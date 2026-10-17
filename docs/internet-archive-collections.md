# Internet Archive collections used by OpenReel

OpenReel's only video source is [archive.org](https://archive.org) — the Internet
Archive, a non-profit digital library. The ingester queries these collections via
`advancedsearch.php` and reads per-item file lists from `/metadata/{identifier}`.

| Collection | What it holds | Licence basis |
| --- | --- | --- |
| `feature_films` | Public-domain feature-length narrative films | Internet Archive public domain collection; individual items may carry a `licenseurl` which OpenReel surfaces verbatim |
| `film_noir` | Noir and hardboiled crime features in the public domain | Public domain collection |
| `sci-fi_horror` | Public-domain science fiction and horror features | Public domain collection |
| `classic_tv` | Public-domain television episodes and series | Public domain collection |
| `serials` | Public-domain theatrical serials | Public domain collection |
| `animationandcartoons` | Public-domain animation and cartoons | Public domain collection |
| `prelinger` | Prelinger Archives: ephemeral, educational and advertising film | Prelinger Archives grants free access and reuse; see the collection page for terms |
| `silent_films` | Silent-era features and shorts | Public domain collection |
| `mysteryandcrimefilms` | Public-domain mystery and crime films | Public domain collection |
| `comedy_films` | Public-domain comedy features and shorts | Public domain collection |

Additional collections may be passed at ingest time:

```bash
node scripts/ingest.mjs --collections short_films,moviesandfilms,avgeeks,classic_cartoons
```

## Rights statement

The Internet Archive asserts public-domain or open-licence status per item. That
assertion belongs to the archiving collection and to the uploader, not to
OpenReel. Copyright terms are jurisdiction-specific: a title out of copyright in
the United States may still be protected elsewhere. Each title page links to the
item's archive.org details page, where the licence and upload history are
visible and where corrections happen.

Where an item's metadata carries `licenseurl`, OpenReel stores it in the
catalogue record as `licence`. Otherwise the record says `Public domain`.

## Removal

Takedowns are handled at the archive level. If a title should not be listed,
write to `rights@openreel.example` with the archive.org identifier; the item is
de-listed from the catalogue at the next ingest run while the archive record is
corrected.

## What OpenReel deliberately does not do

- No scraping of commercial streaming providers.
- No circumvention proxies, no referer or hotlink bypass.
- No re-hosting or transcoding of media — playback is a direct HTTPS range
  request to `archive.org/download/...`.
