# Discord Music Bot

## Wisebyte

Use these commands:

```text
npm install
npm start
```

Add the bot and Lavalink credentials as environment variables. Do not upload a
`.env` file.

Required variables:

```text
DISCORD_TOKEN
CLIENT_ID
GUILD_ID
LAVALINK_HOST
LAVALINK_PORT
LAVALINK_PASSWORD
LAVALINK_SECURE
```

Optional variables:

```text
YOUTUBE_API_KEY
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
```

## Lavalink playback errors

The Discord bot resolves a YouTube URL, but audio decoding is performed by the
Lavalink server. If playback reports `no suitable format reader found`, install
and enable a current YouTube source plugin on the Wisebyte Lavalink node, then
restart that node. The bot and Lavalink must use compatible current versions.

Also verify that `LAVALINK_HOST`, `LAVALINK_PORT`, `LAVALINK_PASSWORD`, and
`LAVALINK_SECURE` point to that same node. A bot restart alone cannot repair a
missing or incompatible Lavalink source plugin.