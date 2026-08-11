-- 화분 테이블
create table if not exists plants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nickname text not null,
  species_common text,
  species_scientific text,
  origin text,
  growth_type text, -- '여름형' | '겨울형' | '봄가을형'
  watering_criteria text,
  light_level text,
  location text,
  photo_url text,
  last_watered_at date
);

-- 성장 로그 테이블
create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  plant_id uuid not null references plants(id) on delete cascade,
  log_date date not null default current_date,
  event_tags text[] not null default '{}', -- 물주기, 분갈이, 순지르기, 개화, 상태변화, 기록
  photos text[] not null default '{}',
  memo text,
  weather jsonb
);

-- 개인용 앱: 로그인 없이 anon 키로 전체 접근 허용
alter table plants enable row level security;
create policy "allow all on plants" on plants for all using (true) with check (true);

alter table logs enable row level security;
create policy "allow all on logs" on logs for all using (true) with check (true);

-- 사진 저장 버킷 생성 (공개 읽기)
insert into storage.buckets (id, name, public)
values ('plant-photos', 'plant-photos', true)
on conflict (id) do nothing;

create policy "public insert plant-photos" on storage.objects
  for insert to anon with check (bucket_id = 'plant-photos');

create policy "public update plant-photos" on storage.objects
  for update to anon using (bucket_id = 'plant-photos');

create policy "public delete plant-photos" on storage.objects
  for delete to anon using (bucket_id = 'plant-photos');

create policy "public select plant-photos" on storage.objects
  for select to anon using (bucket_id = 'plant-photos');

-- 푸시 알림 구독 정보 테이블
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null
);

alter table push_subscriptions enable row level security;
create policy "allow all on push_subscriptions" on push_subscriptions for all using (true) with check (true);
