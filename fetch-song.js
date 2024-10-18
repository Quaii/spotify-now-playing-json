const fs = require('fs');
const axios = require('axios');
const qs = require('querystring');

// Replace these with your Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'https://quaii.github.io/spotify-now-playing-json/'; // Your GitHub Pages URL

async function getAccessToken(code) {
    const tokenURL = 'https://accounts.spotify.com/api/token';
    const data = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    };

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
        const response = await axios.post(tokenURL, qs.stringify(data), { headers });
        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token // Save refresh token for later use
        };
    } catch (error) {
        console.error('Error fetching access token:', error.response.data);
        return null;
    }
}

async function fetchCurrentlyPlaying(accessToken) {
    const url = 'https://api.spotify.com/v1/me/player/currently-playing';

    const headers = {
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const response = await axios.get(url, { headers });
        console.log("API Response:", response.data); // Debugging line
        if (response.data && response.data.item) {
            const track = response.data.item;
            return {
                artist: track.artists[0].name,
                track: track.name,
                album_art: track.album.images[0].url
            };
        }
        return null; // Return null if no track is playing
    } catch (error) {
        console.error('Error fetching currently playing track:', error.response.data);
        return null;
    }
}

async function updateJSON() {
    // Replace 'YOUR_AUTHORIZATION_CODE' with the actual code obtained from Spotify
    const code = 'AQDaRkS0vuAt3H-IGM7vQYExYBdec6Ue77Xc2SNzjpZ1F8SfBDFpN5R5blorvu1WCB-ZMwUPGKfN8TH8bu51vwJhWHd_elzS8XwWXs0lc8aldwwIrMdzDUC_dFBszqP-FECv0pnmP5emeUFP6HgLHQ8dVT4G2eapCvMS2sGXhnE86f-PZBti0UZ9SBUwdCnF_Vs8Rb_sH5FFDg64fgKj1ZCcMFgxbI9D5Ff4DRm95Q'; // Replace with the code from your URL
    const tokens = await getAccessToken(code);

    if (!tokens) return; // If token retrieval failed, exit

    const songData = await fetchCurrentlyPlaying(tokens.accessToken);
    if (songData) {
        fs.writeFileSync('data.json', JSON.stringify(songData, null, 2));
        console.log('JSON updated with current song data:', songData);
    } else {
        console.log('No track is currently playing.');
    }
}

// Call the updateJSON function
updateJSON();
