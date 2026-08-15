// scripts/scrape-rankings.mjs
// Scrapes https://evwsports.com/rankings/ and upserts into Supabase.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/scrape-rankings.mjs
//
// Schedule via GitHub Action (daily) or n8n cron.

import 'dotenv/config';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SOURCE = { name: 'EVW', url: 'https://evwsports.com/rankings/' };

const COUNTRY_TO_ISO = {
  'georgia': 'GE', 'russia': 'RU', 'canada': 'CA', 'usa': 'US', 'united states': 'US',
  'ukraine': 'UA', 'poland': 'PL', 'kazakhstan': 'KZ', 'italy': 'IT', 'moldova': 'MD',
  'belarus': 'BY', 'brazil': 'BR', 'lithuania': 'LT', 'germany': 'DE', 'france': 'FR',
  'turkey': 'TR', 'türkiye': 'TR', 'iran': 'IR', 'iraq': 'IQ', 'china': 'CN',
  'japan': 'JP', 'south korea': 'KR', 'korea': 'KR', 'mongolia': 'MN', 'india': 'IN',
  'australia': 'AU', 'new zealand': 'NZ', 'mexico': 'MX', 'argentina': 'AR',
  'chile': 'CL', 'colombia': 'CO', 'venezuela': 'VE', 'cuba': 'CU', 'egypt': 'EG',
  'south africa': 'ZA', 'nigeria': 'NG', 'kenya': 'KE', 'united kingdom': 'GB', 'uk': 'GB',
  'great britain': 'GB', 'england': 'GB', 'scotland': 'GB', 'wales': 'GB',
  'ireland': 'IE', 'netherlands': 'NL', 'belgium': 'BE', 'sweden': 'SE', 'norway': 'NO',
  'finland': 'FI', 'denmark': 'DK', 'spain': 'ES', 'portugal': 'PT', 'switzerland': 'CH',
  'austria': 'AT', 'czechia': 'CZ', 'czech republic': 'CZ', 'slovakia': 'SK', 'hungary': 'HU',
  'romania': 'RO', 'bulgaria': 'BG', 'serbia': 'RS', 'croatia': 'HR', 'slovenia': 'SI',
  'greece': 'GR', 'albania': 'AL', 'cyprus': 'CY', 'malta': 'MT', 'iceland': 'IS',
  'estonia': 'EE', 'latvia': 'LV', 'armenia': 'AM', 'azerbaijan': 'AZ', 'uzbekistan': 'UZ',
  'turkmenistan': 'TM', 'kyrgyzstan': 'KG', 'tajikistan': 'TJ', 'pakistan': 'PK',
  'afghanistan': 'AF', 'saudi arabia': 'SA', 'uae': 'AE', 'qatar': 'QA', 'kuwait': 'KW',
};
function isoFor(name) {
  if (!name) return '';
  return COUNTRY_TO_ISO[name.trim().toLowerCase()] ?? '';
}

const WEIGHT_LONG_TO_CODE = {
  'super heavyweight': 'SHW', 'heavyweight': 'HW', 'light heavyweight': 'LHW',
  'middleweight': 'MW', 'welterweight': 'WW', 'lightweight': 'LW', 'featherweight': 'FE',
};
function codeForWeight(longName) {
  const key = (longName || '').toLowerCase().replace(/\s*plus$/, '').trim();
  return WEIGHT_LONG_TO_CODE[key] ?? '';
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parseEVW(html) {
  const $ = cheerio.load(html);
  const rows = [];
  const now = new Date().toISOString();

  $('div.evw-ranking-block').each((_, block) => {
    const $block = $(block);
    const titleText = $block.find('.evw-champ-title').first().text().trim();
    const armMatch = titleText.match(/^(Right|Left)\s+Arm\s+(.+?)\s*\(/i);
    if (!armMatch) return;
    const arm = armMatch[1].toLowerCase();
    const weightClass = codeForWeight(armMatch[2].trim());
    if (!weightClass) return;

    const kgText = $block.find('.evw-champ-title span').first().text();
    const kgMatch = kgText.match(/(\d+)\s*kg/);
    const weightKg = kgMatch ? parseFloat(kgMatch[1]) : null;

    const champName = $block.find('.evw-champ-name').first().clone()
      .find('.evw-rank-move').remove().end()
      .text().replace(/^(NEW\s+)?World Champion/i, '').trim();
    const champCountry = $block.find('.evw-champ-country').first().text().trim();
    if (champName) {
      rows.push({
        rank: 1, athlete_name: champName,
        country: isoFor(champCountry), country_name: champCountry,
        weight_class: weightClass, weight_kg: weightKg, arm_hand: arm,
        source: SOURCE.name, source_url: SOURCE.url, updated_at: now,
      });
    }

    $block.find('.evw-ranking-item').each((__, item) => {
      const $item = $(item);
      const rankText = $item.find('.evw-rank').first().text().trim();
      const rankMatch = rankText.match(/^(\d+)/);
      if (!rankMatch) return;
      const name = $item.find('.evw-athlete-name').first().clone()
        .find('.evw-rank-move').remove().end()
        .text().trim();
      const country = $item.find('.evw-country').first().text().trim();
      if (!name) return;
      rows.push({
        rank: parseInt(rankMatch[1], 10), athlete_name: name,
        country: isoFor(country), country_name: country,
        weight_class: weightClass, weight_kg: weightKg, arm_hand: arm,
        source: SOURCE.name, source_url: SOURCE.url, updated_at: now,
      });
    });
  });

  return rows;
}

async function upsert(rows) {
  if (!rows.length) { console.log('no rows parsed — check selectors'); return; }
  console.log(`upserting ${rows.length} rows`);
  const { error } = await supabase
    .from('rankings')
    .upsert(rows, { onConflict: 'athlete_name,weight_class,arm_hand,source' });
  if (error) throw error;
  console.log('ok');
}

async function main() {
  console.log(`fetching ${SOURCE.url}`);
  const html = await fetchHtml(SOURCE.url);
  console.log(`got ${html.length} bytes`);
  const rows = parseEVW(html);
  console.log(`parsed ${rows.length} rows`);
  if (rows.length) console.log('sample:', JSON.stringify(rows.slice(0, 3), null, 2));
  await upsert(rows);
}

main().catch((e) => { console.error('failed:', e); process.exit(1); });
