const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const SpotifyWebApi = require('spotify-web-api-node');

// Set up Express app
const app = express();
app.use(express.static('public'));

// Set up authentication
const clientId = 'your_client_id';
const clientSecret = 'your_client_secret';
const redirectUri = 'your_redirect_uri';

const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri
});

spotifyApi.clientCredentialsGrant().then(function(data) {
  spotifyApi.setAccessToken(data.body['access_token']);
});

// Set up database
const db = new sqlite3.Database('playlists.db');

// Define route to fetch random playlist
app.get('/random_playlist', function(req, res) {
  db.get('SELECT name FROM playlists ORDER BY RANDOM() LIMIT 1', function(err, row) {
    if (err) {
      console.log('Error getting random playlist:', err);
      res.status(500).send('Internal Server Error');
    } else {
      const playlistName = row.name;
      res.json({ name: playlistName });
    }
  });
});

// Start server
const port = 3000;
app.listen(port, function() {
  console.log(`Server listening on port ${port}`);
});
