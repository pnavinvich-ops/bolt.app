// scripts/test-parse.mjs
// Parse the locally-cached evw-page.html and print results.
// Run: node scripts/test-parse.mjs

import * as cheerio from 'cheerio';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, 'evw-page.html'), 'utf8');

const COUNTRY_TO_ISO = {
  'georgia': 'GE', 'russia': 'RU', 'canada': 'CA', 'usa': 'US', 'united states': 'US',
  'ukraine': 'UA', 'poland': 'PL', 'kazakhstan': 'KZ', 'italy': 'IT', 'moldova': 'MD',
  'belarus': 'BY', 'brazil': 'BR', 'lithuania': 'LT', 'germany': 'DE', 'france': 'FR',
  'turkey': 'TR', 'türkiye': 'TR', 'romania': 'RO', 'bulgaria': 'BG', 'croatia': 'HR',
  'serbia': 'RS', 'latvia': 'LV', 'sweden': 'SE', 'israel': 'IL', 'armenia': 'AM',
  'japan': 'JP', 'spain': 'ES', 'uk': 'GB', 'united kingdom': 'GB', 'australia': 'AU',
  'singapore': 'SG',
};
function isoFor(name) { return COUNTRY_TO_ISO[(name || '').trim().toLowerCase()] ?? ''; }

const WEIGHT_LONG_TO_CODE = {
  'super heavyweight': 'SHW', 'heavyweight': 'HW', 'light heavyweight': 'LHW',
  'middleweight': 'MW', 'welterweight': 'WW', 'lightweight': 'LW', 'featherweight': 'FE',
};
function codeForWeight(longName) {
  const key = (longName || '').toLowerCase().replace(/\s*plus$/, '').trim();
  return WEIGHT_LONG_TO_CODE[key] ?? '';
}

const $ = cheerio.load(html);
const rows = [];

$('div.evw-ranking-block').each((_, block) => {
  const $b = $(block);
  const titleText = $b.find('.evw-champ-title').first().text().trim();
  const armMatch = titleText.match(/^(Right|Left)\s+Arm\s+(.+?)\s*\(/i);
  if (!armMatch) return;
  const arm = armMatch[1].toLowerCase();
  const weightClass = codeForWeight(armMatch[2].trim());
  if (!weightClass) return;

  const champName = $b.find('.evw-champ-name').first().clone()
    .find('.evw-rank-move').remove().end()
    .text().replace(/^(NEW\s+)?World Champion/i, '').trim();
  const champCountry = $b.find('.evw-champ-country').first().text().trim();
  if (champName) rows.push({
    rank: 1, athlete_name: champName,
    country: isoFor(champCountry), country_name: champCountry,
    weight_class: weightClass, arm_hand: arm,
  });

  $b.find('.evw-ranking-item').each((__, item) => {
    const $i = $(item);
    const r = $i.find('.evw-rank').first().text().trim().match(/^(\d+)/);
    if (!r) return;
    const name = $i.find('.evw-athlete-name').first().clone()
      .find('.evw-rank-move').remove().end()
      .text().trim();
    const country = $i.find('.evw-country').first().text().trim();
    if (!name) return;
    rows.push({
      rank: parseInt(r[1], 10), athlete_name: name,
      country: isoFor(country), country_name: country,
      weight_class: weightClass, arm_hand: arm,
    });
  });
});

console.log(`parsed ${rows.length} rows`);
const bySection = {};
for (const r of rows) {
  const k = `${r.arm_hand} ${r.weight_class}`;
  (bySection[k] ??= []).push(r);
}
for (const [k, v] of Object.entries(bySection)) {
  console.log(`\n${k} (${v.length}):`);
  for (const a of v) console.log(`  ${a.rank}. ${a.athlete_name} (${a.country_name} → ${a.country || '?'})`);
}
