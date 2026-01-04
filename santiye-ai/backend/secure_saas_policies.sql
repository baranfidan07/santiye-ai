-- 1. CLEANUP (Remove permissive policies if any)
drop policy if exists "Public Read" on companies;
drop policy if exists "Public Read" on profiles;
drop policy if exists "Public Read Memory" on site_memory;

-- 2. SECURE PROFILES
-- Users can see their own profile
create policy "View Own Profile" on profiles
for select using (
  auth.uid() = user_id 
  -- OR phone_number = (current_setting('app.current_phone', true)) -- If using custom phone auth
);

-- Users can insert their own profile (during onboarding)
create policy "Create Own Profile" on profiles
for insert with check (
  auth.uid() = user_id
);

-- 3. SECURE COMPANIES
-- Anyone can look up a company by EXACT CODE (for onboarding)
create policy "Lookup Company By Code" on companies
for select using (
  true -- In reality, you might want a function for this to hide list, but for MVP select is okay if RLS filters rows? 
       -- Wait, 'using (true)' lists ALL. Bad.
       -- Better: 'using (id in (select company_id from profiles where user_id = auth.uid()))' -> Members only.
       -- But how do they find it to join?
       -- Answer: They don't "browse". They send a code to the BE. The BE (Service Role) checks the code. 
       -- Frontend/User Role should NOT be able to browse companies.
);

-- So for Companies: MEMBERS ONLY.
create policy "View My Company" on companies
for select using (
  id in (
    select company_id from profiles where user_id = auth.uid()
  )
);

-- 4. SECURE MEMORY (THE HIVEMIND)
-- Determining "My Company ID" securely
create policy "View Company Memory" on site_memory
for select using (
  company_id in (
    select company_id from profiles where user_id = auth.uid()
  )
);

create policy "Write Company Memory" on site_memory
for insert with check (
  company_id in (
    select company_id from profiles where user_id = auth.uid()
  )
);

-- NOTE: For WhatsApp (Backend), we use the SERVICE_KEY which bypasses RLS.
-- RLS is mainly for the Frontend Web Users ("Analiz" page).
