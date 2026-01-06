-- 1. DEMO COMPANY
insert into companies (name, code, subscription_tier)
values ('Kayı İnşaat A.Ş.', '#KAYI', 'enterprise')
on conflict (code) do nothing;

-- 2. GET COMPANY ID
do $$
declare
  company_uuid uuid;
begin
  select id into company_uuid from companies where code = '#KAYI';

  -- 3. LINK YOUR PHONE (Replace with your actual number in Supabase if needed, or rely on bot auto-create)
  -- This is just to ensure the ID exists for manual reference if needed.
end $$;
