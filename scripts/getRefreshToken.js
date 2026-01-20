/**
 * HOW TO RUN:
 * 1. Ensure you have the required dependencies:
 *    npm install google-auth-library open
 * 
 * 2. Run the script:
 *    node scripts/getRefreshToken.js
 * 
 * DESCRIPTION:
 * This script automates the Google Ads API OAuth2 "Refresh Token" handshake.
 * It starts a local server on port 3000 to capture the callback automatically.
 */

const { OAuth2Client } = require('google-auth-library');
const http = require('http');
const url = require('url');
const readline = require('readline');

async function start() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    console.log('\n\x1b[36m%s\x1b[0m', '=== Swan Lake AI: Google Ads Refresh Token Helper ===');
    console.log('Use this tool to generate your GOOGLE_ADS_REFRESH_TOKEN in seconds.\n');

    const clientId = await question('Step 1: Paste your Google OAuth Client ID: ');
    const clientSecret = await question('Step 2: Paste your Google OAuth Client Secret: ');

    if (!clientId || !clientSecret) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: Both Client ID and Client Secret are required.');
        process.exit(1);
    }

    const redirectUri = 'http://localhost:3000';
    const scope = 'https://www.googleapis.com/auth/adwords';

    const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scope,
        prompt: 'consent' // Necessary to ensure a refresh_token is returned
    });

    const server = http.createServer(async (req, res) => {
        try {
            const currentUrl = new url.URL(req.url, 'http://localhost:3000');
            const code = currentUrl.searchParams.get('code');

            if (code) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <div style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #0B1120; color: white; height: 100vh;">
                        <h1 style="color: #10b981; font-size: 48px;">Success!</h1>
                        <p style="font-size: 18px; color: #94a3b8;">Authentication complete. Return to your terminal to copy the token.</p>
                    </div>
                `);
                
                server.close();

                const { tokens } = await oAuth2Client.getToken(code);
                
                console.log('\n\x1b[32m%s\x1b[0m', '=======================================================');
                console.log('\x1b[32m%s\x1b[0m', 'SUCCESS! YOUR REFRESH TOKEN IS:');
                console.log('\x1b[1m\x1b[37m%s\x1b[0m', tokens.refresh_token);
                console.log('\x1b[32m%s\x1b[0m', '=======================================================\n');
                
                console.log('\x1b[33m%s\x1b[0m', 'FINAL STEPS:');
                console.log('1. Open your .env.local file.');
                console.log(`2. Paste the token: GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
                console.log('3. Restart your Next.js dev server.\n');
                
                process.exit(0);
            }
        } catch (e) {
            console.error('\x1b[31m%s\x1b[0m', 'Error exchanging code for token:', e.message);
            res.writeHead(500);
            res.end('Failed to exchange code. Check terminal.');
            process.exit(1);
        }
    }).listen(3000, async () => {
        console.log('\n\x1b[35m%s\x1b[0m', 'Opening browser for Google Authorization...');
        console.log('\x1b[2m%s\x1b[0m', 'Link: ' + authorizeUrl);
        
        try {
            const open = (await import('open')).default;
            await open(authorizeUrl);
        } catch (err) {
            console.log('\n\x1b[33m%s\x1b[0m', 'Note: Could not open browser automatically. Please copy the link above.');
        }
    });
}

start().catch(err => {
    console.error('\x1b[31m%s\x1b[0m', 'Fatal Error:', err);
    process.exit(1);
});