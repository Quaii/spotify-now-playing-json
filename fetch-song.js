const fs = require('fs');
const axios = require('axios');
const qs = require('querystring');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost/callback'; // Change this to your actual redirect URI

let accessToken = ''; // Variable to store the access token
let refreshToken = ''; // Variable to store the refresh token

// Step 1: Get authorization code manually from Spotify
// You will need to visit this URL to get the authorization code
// const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=user-read-playback-state`;
// console.log(AUTH_URL);

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
        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token; // Save refresh token for later use
        console.log('Access token retrieved.');
    } catch (error) {
        console.error('Error fetching access token:', error.response.data);
    }
}

async function fetchCurrentlyPlaying() {
    const url = 'https://api.spotify.com/v1/me/player/currently-playing';

    const headers = {
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const response = await axios.get(url, { headers });
        if (response.data && response.data.item) {
            const track = response.data.item;
            return {
                artist: track.artists[0].name,
                track: track.name,
                album_art: track.album.images[0].url
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching currently playing track:', error.response.data);
        return null;
    }
}

async function updateJSON() {
    // You need to manually get the access token first
    // const code = 'YOUR_AUTHORIZATION_CODE'; // Replace with the code you get after authorizing your app
    // await getAccessToken(code); // Uncomment this line and provide the code

    const songData = await fetchCurrentlyPlaying();
    if (songData) {
        fs.writeFileSync('data.json', JSON.stringify(songData, null, 2));
        console.log('JSON updated with current song data.');
    } else {
        console.log('No track is currently playing.');
    }
}

// Call updateJSON function
updateJSON();
