const Title = require('../models/Title');
const { pool } = require('../config/db');

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const DELAY_MS = 1000; // Jikan rate limit: ~3 req/sec, stay safe with 1/sec

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function mapJikanType(type) {
  const typeMap = {
    'TV': 'anime',
    'Movie': 'movie',
    'OVA': 'ova',
    'Special': 'special',
    'ONA': 'anime',
    'Music': 'special'
  };
  return typeMap[type] || 'anime';
}

function mapJikanStatus(status) {
  const statusMap = {
    'Finished Airing': 'completed',
    'Currently Airing': 'airing',
    'Not yet aired': 'upcoming'
  };
  return statusMap[status] || 'completed';
}

function mapJikanAnime(anime) {
  return {
    name: anime.title,
    type: mapJikanType(anime.type),
    genres: [
      ...(anime.genres || []).map(g => g.name),
      ...(anime.themes || []).map(t => t.name)
    ],
    year: anime.year || (anime.aired?.prop?.from?.year) || null,
    synopsis: anime.synopsis ? anime.synopsis.replace(/\[Written by MAL Rewrite\]/g, '').trim() : '',
    poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
    episodes: anime.episodes || null,
    status: mapJikanStatus(anime.status),
    studio: (anime.studios || []).map(s => s.name).join(' / ') || ''
  };
}

async function fetchPage(url) {
  const res = await fetch(url);
  if (res.status === 429) {
    // Rate limited — wait and retry
    console.log('Rate limited, waiting 3s...');
    await sleep(3000);
    return fetchPage(url);
  }
  if (!res.ok) {
    throw new Error(`Jikan API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function seedFromJikan({ pages = 10, adminUserId = null } = {}) {
  const allTitles = [];

  for (let page = 1; page <= pages; page++) {
    console.log(`Fetching page ${page}/${pages}...`);
    const data = await fetchPage(`${JIKAN_BASE}/top/anime?page=${page}`);

    if (!data.data || data.data.length === 0) break;

    for (const anime of data.data) {
      allTitles.push(mapJikanAnime(anime));
    }

    if (page < pages) await sleep(DELAY_MS);
  }

  console.log(`Fetched ${allTitles.length} titles from Jikan. Inserting...`);

  let inserted = 0;
  let skipped = 0;

  for (const titleData of allTitles) {
    // Skip duplicates by name
    const { rows } = await pool.query(
      'SELECT id FROM titles WHERE name = $1',
      [titleData.name]
    );

    if (rows.length > 0) {
      skipped++;
      continue;
    }

    await Title.create({
      ...titleData,
      createdBy: adminUserId
    });
    inserted++;
  }

  return { fetched: allTitles.length, inserted, skipped };
}

module.exports = seedFromJikan;
