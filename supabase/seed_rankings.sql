-- Sample data so the rankings screen shows something.
-- Run this in the Supabase SQL editor. Safe to delete rows later.

insert into public.rankings (rank, athlete_name, country, country_name, weight_class, weight_kg, arm_hand, points, source, source_url, updated_at) values
  (1, 'Levan Saginashvili',  'GE', 'Georgia',       'SHW', 175.0, 'right', 2850, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (2, 'Vitaly Laletin',      'RU', 'Russia',        'SHW', 168.5, 'right', 2410, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (3, 'Denis Cyplenkov',     'RU', 'Russia',        'SHW', 155.0, 'right', 2380, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (4, 'Andrey Pushkar',      'UA', 'Ukraine',       'SHW', 152.0, 'right', 2120, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (5, 'Devon Larratt',       'CA', 'Canada',        'HW',  108.5, 'right', 2680, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (6, 'Todd Hutchings',      'US', 'United States', 'HW',  117.0, 'right', 2210, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (7, 'Michael Todd',        'US', 'United States', 'HW',  115.0, 'right', 2050, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (8, 'Kurdega Siarhei',     'BY', 'Belarus',       'HW',  110.0, 'right', 1980, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (9, 'Irine Da Silva',      'BR', 'Brazil',        'MW',   95.0, 'right', 1820, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (10, 'Andrei Melniciuk',   'MD', 'Moldova',       'MW',   93.5, 'left',  1740, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (11, 'Nurlanbek Kasymov',  'KZ', 'Kazakhstan',    'MW',   90.0, 'right', 1680, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (12, 'Marina Zhigalova',   'RU', 'Russia',        'LW',   72.0, 'right', 1950, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (13, 'Irina Podshibyakina','RU', 'Russia',        'LW',   68.5, 'right', 1820, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (14, 'Lilia Drab',         'UA', 'Ukraine',       'WW',   63.0, 'right', 1740, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (15, 'Aneta Fijalkowska',  'PL', 'Poland',        'WW',   60.5, 'right', 1690, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (16, 'Dave Chaffee',       'US', 'United States', 'SHW', 150.0, 'left',  2150, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (17, 'Jerry Cadorette',    'US', 'United States', 'SHW', 145.0, 'right', 1980, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (18, 'Alex Kurdega',       'PL', 'Poland',        'HW',  108.0, 'right', 1820, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (19, 'Tomasz Lewandowski', 'PL', 'Poland',        'MW',   92.0, 'right', 1610, 'WAF', 'https://www.waf-armwrestling.com/rankings', now()),
  (20, 'Mindaugas Taraila',  'LT', 'Lithuania',     'HW',  104.0, 'right', 1750, 'WAF', 'https://www.waf-armwrestling.com/rankings', now())
on conflict (athlete_name, weight_class, arm_hand, source) do nothing;
