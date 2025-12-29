-- Add locale column to confessions table for language-specific content
ALTER TABLE confessions ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'tr';

-- Create index for faster filtering by locale
CREATE INDEX IF NOT EXISTS idx_confessions_locale ON confessions(locale);

-- Insert English confessions with catchy hooks
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale) VALUES

-- Relationship Drama
('He follows his ex on a secret finsta...

Found out my boyfriend of 2 years has a hidden Instagram account. He only uses it to follow his ex and her friends. When I confronted him, he said "it''s just to see if she''s doing okay." I feel like I''m going crazy. Am I overreacting or is this a massive red flag? 🚩

He swears nothing is going on and that I''m being insecure. But why hide it then?', 'İlişki', 75, 0, 0, 'en'),

-- Situationship Chaos
('We''ve been "talking" for 8 months but he won''t make it official...

I (23F) have been seeing this guy (25M) since April. We do everything couples do - dates, sleepovers, meeting friends. But every time I bring up "what are we?", he says he''s "not ready for labels."

Yesterday I saw him on Hinge. When I asked about it, he said "we never said we were exclusive." I''m so confused. Was I wrong to assume?', 'Flört', 60, 0, 0, 'en'),

-- Ex Texted Back
('My ex texted me "I miss us" at 2 AM...

We broke up 6 months ago because he cheated. Zero contact until last night when he sent "I miss us. Can we talk?" followed by "I know I messed up but I''ve changed."

Part of me wants to believe him but my friends say it''s a trap. He only texts when he''s drunk and lonely. Should I even respond? 🤔', 'Ex', 80, 0, 0, 'en'),

-- Love Bombing Alert
('New guy is already talking about marriage after 3 weeks???

I (28F) matched with him on Bumble 3 weeks ago. He''s already said "I love you," talked about our future kids'' names, and wants me to meet his parents next weekend.

My friends say this is love bombing. He says he just "knows what he wants." I feel special but also scared. Is this a red flag?', 'Toksik', 85, 0, 0, 'en'),

-- Ghosted After "Best Date Ever"
('He said it was the best date of his life... then vanished

We had an amazing 5-hour first date last week. He texted me after saying "That was the best date I''ve ever had, I can''t wait to see you again." We made plans for date #2.

Then... nothing. Complete radio silence. No response to my messages. Did I imagine the chemistry? What happened? 👻', 'Flört', 55, 0, 0, 'en'),

-- Partner Always On Phone
('"Why are you always checking my phone?"

My girlfriend gets defensive whenever I even glance at her screen. She tilts it away, takes it to the bathroom, sleeps with it under her pillow. When I asked about it, she accused ME of being controlling.

I never thought I was paranoid until now. Am I wrong for being suspicious or is trust already broken?', 'İlişki', 70, 0, 0, 'en'),

-- Friend Zone Escape Attempt
('I confessed to my best friend and now everything is awkward

After 4 years of friendship and being in love with her the whole time, I finally told my best friend how I feel. She said she "never thought of me that way" but still wants to be friends.

Now she takes hours to reply and we barely hang out. I ruined everything, didn''t I? 💔', 'Diğer', 45, 0, 0, 'en'),

-- Hot Take Confession
('I secretly check my partner''s location 10+ times a day

We share locations "for safety" but I check his every hour. Sometimes more. I have no reason to distrust him, I just... can''t help it. I know it''s unhealthy but stopping makes me anxious.

Is this toxic or just being cautious? Be honest. Roast me if needed.', 'Toksik', 65, 0, 0, 'en');

-- Update existing Turkish confessions to have locale = 'tr' explicitly
UPDATE confessions SET locale = 'tr' WHERE locale IS NULL OR locale = '';
