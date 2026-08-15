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

const SOURCES = [
  { name: 'WAF', url: 'https://www.waf-armwrestling.com/rankings' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'ArmLogBot/1.0 (+https://armlog.app)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parseWAF($) {
  const rows = [];
  $('table.rankings tbody tr').each((_, el) => {
    const tds = $(el).find('td');
    if (tds.length < 5) return;
    rows.push({
      rank: parseInt($(tds[0]).text().trim(), 10),
      athlete: $(tds[1]).text().trim(),
      country: $(tds[2]).text().trim().slice(0, 2).toUpperCase(),
      weight_class: $(tds[3]).text().trim(),
      arm_hand: $(tds[4]).text().trim().toLowerCase() === 'left' ? 'left' : 'right',
    });
  });
  return rows;
}

async function scrapeSource(src) {
  console.log(`[${src.name}] fetching ${src.url}`);
  const html = await fetchHtml(src.url);
  const $ = cheerio.load(html);
  const rows = src.name === 'WAF' ? parseWAF($) : [];
  console.log(`[${src.name}] parsed ${rows.length} rows`);
  return rows.map((r) => ({ ...r, source: src.name, source_url: src.url, updated_at: new Date().toISOString() }));
}

async function upsert(rows) {
  if (!rows.length) return;
  const { error } = await supabase
    .from('rankings')
    .upsert(rows, { onConflict: 'athlete_name,weight_class,arm_hand,source,updated_at' });
  if (error) throw error;
}

async function main() {
  for (const src of SOURCES) {
    try {
      const rows = await scrapeSource(src);
      await upsert(rows);
      await sleep(1500);
    } catch (e) {
      console.error(`[${src.name}] failed:`, e.message);
    }
  }
  console.log('done');
}

main().catch((e) => { console.error(e); process.exit(1); });
