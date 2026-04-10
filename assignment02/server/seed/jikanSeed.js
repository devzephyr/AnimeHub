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
    console.log('Rate limited, waiting 4s...');
    await sleep(4000);
    return fetchPage(url);
  }
  if (!res.ok) {
    throw new Error(`Jikan API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function fetchEndpoint(url, pages) {
  const titles = [];
  for (let page = 1; page <= pages; page++) {
    const separator = url.includes('?') ? '&' : '?';
    const fullUrl = `${url}${separator}page=${page}`;
    console.log(`  Fetching ${fullUrl}`);
    try {
      const data = await fetchPage(fullUrl);
      if (!data.data || data.data.length === 0) break;
      for (const anime of data.data) {
        titles.push(mapJikanAnime(anime));
      }
      // Stop if there are no more pages
      if (!data.pagination?.has_next_page) break;
    } catch (err) {
      console.log(`  Error on page ${page}: ${err.message}, moving on`);
      break;
    }
    await sleep(DELAY_MS);
  }
  return titles;
}

// All the anime endpoints to pull from
const ENDPOINTS = [
  { name: 'Top Rated',         url: `${JIKAN_BASE}/top/anime`,                          pages: 40 },
  { name: 'Most Popular',      url: `${JIKAN_BASE}/top/anime?filter=bypopularity`,      pages: 40 },
  { name: 'Most Favorited',    url: `${JIKAN_BASE}/top/anime?filter=favorite`,           pages: 20 },
  { name: 'Currently Airing',  url: `${JIKAN_BASE}/seasons/now`,                         pages: 10 },
  { name: 'Upcoming',          url: `${JIKAN_BASE}/seasons/upcoming`,                    pages: 10 },
  { name: 'Winter 2025',       url: `${JIKAN_BASE}/seasons/2025/winter`,                 pages: 5 },
  { name: 'Fall 2024',         url: `${JIKAN_BASE}/seasons/2024/fall`,                   pages: 5 },
  { name: 'Summer 2024',       url: `${JIKAN_BASE}/seasons/2024/summer`,                 pages: 5 },
  { name: 'Spring 2024',       url: `${JIKAN_BASE}/seasons/2024/spring`,                 pages: 5 },
  { name: 'Winter 2024',       url: `${JIKAN_BASE}/seasons/2024/winter`,                 pages: 5 },
  { name: 'Fall 2023',         url: `${JIKAN_BASE}/seasons/2023/fall`,                   pages: 5 },
  { name: 'Summer 2023',       url: `${JIKAN_BASE}/seasons/2023/summer`,                 pages: 5 },
  { name: 'Spring 2023',       url: `${JIKAN_BASE}/seasons/2023/spring`,                 pages: 5 },
  { name: 'Movies',            url: `${JIKAN_BASE}/anime?type=movie&order_by=score&sort=desc`, pages: 20 },
  { name: 'OVAs',              url: `${JIKAN_BASE}/anime?type=ova&order_by=score&sort=desc`,   pages: 10 },
];

async function seedFromJikan({ pages = 10, adminUserId = null, endpoints = null } = {}) {
  // If a specific endpoint list is given, use it. Otherwise use all.
  const endpointList = endpoints
    ? ENDPOINTS.filter(e => endpoints.includes(e.name))
    : ENDPOINTS;

  // Override page counts if pages param is given and less than default
  const useEndpoints = endpointList.map(e => ({
    ...e,
    pages: Math.min(e.pages, pages)
  }));

  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const endpoint of useEndpoints) {
    console.log(`\n--- ${endpoint.name} (up to ${endpoint.pages} pages) ---`);
    const titles = await fetchEndpoint(endpoint.url, endpoint.pages);
    console.log(`  Fetched ${titles.length} from ${endpoint.name}`);
    totalFetched += titles.length;

    let inserted = 0;
    let skipped = 0;

    for (const titleData of titles) {
      // Skip duplicates by name
      const { rows } = await pool.query(
        'SELECT id FROM titles WHERE name = $1',
        [titleData.name]
      );

      if (rows.length > 0) {
        skipped++;
        continue;
      }

      try {
        await Title.create({
          ...titleData,
          createdBy: adminUserId
        });
        inserted++;
      } catch (err) {
        console.log(`  Failed to insert "${titleData.name}": ${err.message}`);
        skipped++;
      }
    }

    console.log(`  Inserted: ${inserted}, Skipped: ${skipped}`);
    totalInserted += inserted;
    totalSkipped += skipped;
  }

  return { fetched: totalFetched, inserted: totalInserted, skipped: totalSkipped };
}

module.exports = seedFromJikan;
