-- ─── share_links（只读分享）─────────────────────
-- 用于"分享我的进度"功能，生成 ?shared=<token> 的只读链接

create table public.share_links (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  token       text not null unique,
  kind        text not null check (kind in ('calendar','gantt','profile')),
  label       text,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index share_links_token_idx on public.share_links(token);

-- share_links 的 RLS：用户只能管自己的；读取用单独的 anon-selectable view
alter table public.share_links enable row level security;

create policy "share_links: read own" on public.share_links for select using (auth.uid() = user_id);
create policy "share_links: insert own" on public.share_links for insert with check (auth.uid() = user_id);
create policy "share_links: delete own" on public.share_links for delete using (auth.uid() = user_id);

-- 公开 view：通过 token 读取（仅返回安全字段）
create or replace view public.public_share as
  select s.token, s.kind, s.label, s.created_at, s.expires_at,
         p.display_name, p.role, p.bio, p.avatar_color
  from public.share_links s
  join public.profiles p on p.id = s.user_id
  where s.expires_at is null or s.expires_at > now();

grant select on public.public_share to anon, authenticated;
