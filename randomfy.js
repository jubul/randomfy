const sqlite3 = require('sqlite3').verbose();
const prompt = require('prompt-sync')();
const SpotifyWebApi = require('spotify-web-api-node');

// Prompt user for OAuth credentials
const clientId = prompt('Enter your Spotify client ID: ');
const clientSecret = prompt('Enter your Spotify client secret: ');
const redirectUri = prompt('Enter your Spotify redirect URI: ');

// Set up authentication
const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri
});

spotifyApi.clientCredentialsGrant().then(function(data) {
  // Save the access token so that it's used in future calls
  spotifyApi.setAccessToken(data.body['access_token']);

  // Get user's saved playlists
  spotifyApi.getUserPlaylists().then(function(data) {
    const playlists = data.body.items;

    // Create database and table
    const db = new sqlite3.Database('playlists.db');
    db.serialize(function() {
      db.run('CREATE TABLE IF NOT EXISTS playlists (name TEXT, uri TEXT)');

      // Insert playlists into database
      const stmt = db.prepare('INSERT INTO playlists VALUES (?, ?)');
      playlists.forEach(function(playlist) {
        stmt.run(playlist.name, playlist.uri);
      });
      stmt.finalize();

      // Select a playlist randomly and print its name
      db.get('SELECT name FROM playlists ORDER BY RANDOM() LIMIT 1', function(err, row) {
        console.log('Random playlist:', row.name);
        db.close();
      });
    });
  }, function(err) {
    console.log('Error getting playlists:', err);
  });
}, function(err) {
  console.log('Error getting access token:', err);
});
