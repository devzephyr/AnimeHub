const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve(__dirname, '../screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport to a typical desktop size
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navigating to Login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

    // Login
    console.log('Logging in...');
    await page.type('input[type="email"]', 'user@animehub.com');
    await page.type('input[type="password"]', 'password123');

    // Submit and wait for navigation
    await Promise.all([
        page.click('button[type="submit"]'), // Adjust selector if needed
        page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]).catch(e => console.log('Navigation timeout or error after login (might be SPA routing):', e.message));

    // 1. Home Page
    console.log('Taking screenshot: home.png');
    // Give it a moment for any fetch to complete
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home.png') });

    // 2. Browse Page
    console.log('Navigating to Browse...');
    await page.goto(`${BASE_URL}/browse`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    console.log('Taking screenshot: browse.png');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'browse.png') });

    // 3. Title Details
    console.log('Navigating to Title Details...');
    // Click the first title card link. Assuming it's an anchor tag inside a grid.
    // We'll look for an href starting with /titles/
    const titleLink = await page.$('a[href^="/titles/"]');
    if (titleLink) {
        await titleLink.click();
        // Wait for the details page
        try {
            await page.waitForSelector('h1', { timeout: 5000 });
            await new Promise(r => setTimeout(r, 1000)); // Wait for reviews/images
            console.log('Taking screenshot: title-details.png');
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'title-details.png') });
        } catch (e) {
            console.error('Could not load title details page:', e.message);
        }
    } else {
        console.error('No title links found on Browse page.');
    }

    // 4. Watchlist
    console.log('Navigating to Watchlist...');
    await page.goto(`${BASE_URL}/watchlist`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    console.log('Taking screenshot: watchlist.png');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'watchlist.png') });

    // 5. Profile
    console.log('Navigating to Profile...');
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    console.log('Taking screenshot: profile.png');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'profile.png') });

    console.log('All screenshots taken. Closing browser.');
    await browser.close();
})();
