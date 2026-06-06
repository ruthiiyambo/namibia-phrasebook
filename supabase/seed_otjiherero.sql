-- Step 1: Add Otjiherero language
insert into languages (code, name, flag_emoji, sort_order)
values ('her', 'Otjiherero', '🇳🇦', 4)
on conflict (code) do nothing;

-- Step 2: Add Otjiherero phrases
insert into translations (language_id, concept_id, english_text, translated_text, category, type, tier, difficulty, pronunciation)
select l.id, 'C001', 'Good morning', 'Wa penduka', 'Greetings', 'phrase', 'free', 'basic', 'wah pen-DOO-kah' from languages l where l.code = 'her'
union all
select l.id, 'C002', 'Good afternoon', 'Wa tara', 'Greetings', 'phrase', 'free', 'basic', 'wah TAH-rah' from languages l where l.code = 'her'
union all
select l.id, 'C003', 'How are you?', 'Okuhepa nawa?', 'Greetings', 'phrase', 'free', 'basic', 'oh-koo-HEH-pah NAH-wah' from languages l where l.code = 'her'
union all
select l.id, 'C004', 'I am fine', 'Mehepa nawa', 'Greetings', 'phrase', 'free', 'basic', 'meh-HEH-pah NAH-wah' from languages l where l.code = 'her'
union all
select l.id, 'C005', 'Thank you', 'Okuhepa', 'Greetings', 'word', 'free', 'basic', 'oh-koo-HEH-pah' from languages l where l.code = 'her'
union all
select l.id, 'C006', 'Please', 'Mehi', 'Greetings', 'word', 'free', 'basic', 'MEH-hee' from languages l where l.code = 'her'
union all
select l.id, 'C007', 'Goodbye', 'Kaendere', 'Greetings', 'word', 'free', 'basic', 'kah-en-DEH-reh' from languages l where l.code = 'her'
union all
select l.id, 'C008', 'Help!', 'Ndiyambure!', 'Emergency', 'word', 'free', 'basic', 'ndee-yahm-BOO-reh' from languages l where l.code = 'her'
union all
select l.id, 'C009', 'Call the police', 'Tara oupore', 'Emergency', 'phrase', 'free', 'basic', 'TAH-rah oh-POH-reh' from languages l where l.code = 'her'
union all
select l.id, 'C010', 'Where is the hospital?', 'Epuriro riri?', 'Emergency', 'phrase', 'free', 'basic', 'eh-poo-REE-roh REE-ree' from languages l where l.code = 'her'
union all
select l.id, 'C011', 'How much does it cost?', 'Otjingapi?', 'Shopping', 'phrase', 'paid', 'intermediate', 'ot-jeen-GAH-pee' from languages l where l.code = 'her'
union all
select l.id, 'C012', 'That is too expensive', 'Okuhunga nawa', 'Shopping', 'phrase', 'paid', 'intermediate', 'oh-koo-HOON-gah NAH-wah' from languages l where l.code = 'her'
union all
select l.id, 'C013', 'Turn left', 'Zemba kumauwe', 'Directions', 'phrase', 'paid', 'basic', 'ZEM-bah koo-mah-OO-weh' from languages l where l.code = 'her'
union all
select l.id, 'C014', 'Turn right', 'Zemba kumarikare', 'Directions', 'phrase', 'paid', 'basic', 'ZEM-bah koo-mah-ree-KAH-reh' from languages l where l.code = 'her'
union all
select l.id, 'C015', 'Water, please', 'Omeva, mehi', 'Food & Drink', 'phrase', 'paid', 'basic', 'oh-MEH-vah MEH-hee' from languages l where l.code = 'her'
union all
select l.id, 'C016', 'I would like to eat', 'Mehi okurya', 'Food & Drink', 'phrase', 'paid', 'basic', 'MEH-hee oh-KOO-ryah' from languages l where l.code = 'her'
union all
select l.id, 'C017', 'Lion', 'Nguue', 'Wildlife', 'word', 'paid', 'basic', 'ngoo-EH' from languages l where l.code = 'her'
union all
select l.id, 'C018', 'Elephant', 'Ndou', 'Wildlife', 'word', 'paid', 'basic', 'en-DOH' from languages l where l.code = 'her'
union all
select l.id, 'C019', 'Where is the game reserve?', 'Okaruwo okamburiro kuri?', 'Wildlife', 'phrase', 'paid', 'intermediate', 'oh-kah-ROO-woh oh-kahm-boo-REE-roh koo-REE' from languages l where l.code = 'her'
union all
select l.id, 'C020', 'Yes', 'Iye', 'Culture', 'word', 'free', 'basic', 'EE-yeh' from languages l where l.code = 'her'
union all
select l.id, 'C021', 'No', 'Kako', 'Culture', 'word', 'free', 'basic', 'KAH-koh' from languages l where l.code = 'her';
