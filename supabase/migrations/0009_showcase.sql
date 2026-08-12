-- 0009: Community showcase flag. Members with a photo + headline appear in
-- the signed-in home page's profile gallery; this flag lets anyone remove
-- themselves (Settings → "Community showcase"). Default ON: the gallery is
-- only shown to signed-in members and only ever uses name, photo, headline
-- and location — the same fields their link-shareable public profile leads
-- with. Contact details, referees, and record data never appear.

alter table public.profiles
  add column if not exists showcase boolean not null default true;
