const fs = require('fs');
const axios = require('axios');
const qs = require('querystring');

// Replace these with your Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    const tokenURL = 'https://accounts.spotify.com/api/token';
    const data = {
        grant_type: 'client_credentials'
    };

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    };

    try {
        const response = await axios.post(tokenURL, qs.stringify(data), { headers });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
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
        console.error('Error fetching currently playing track:', error);
        return null;
    }
}

async function updateJSON() {
    const accessToken = await getAccessToken();
    if (!accessToken) return;

    const songData = await fetchCurrentlyPlaying(accessToken);
    if (songData) {
        fs.writeFileSync('data.json', JSON.stringify(songData, null, 2));
        console.log('JSON updated with current song data.');
    } else {
        console.log('No track is currently playing.');
    }
}

updateJSON();
