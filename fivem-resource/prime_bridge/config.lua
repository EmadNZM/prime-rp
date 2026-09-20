-- Configuration for PRIME RP FiveM Web Bridge
Config = {}

-- Your PRIME RP web platform URL (e.g. 'https://prime-rp.onrender.com' or 'http://localhost:3000')
Config.WebPlatformUrl = GetConvar('prime_web_url', 'https://prime-rp.onrender.com')

-- Secret API Token matching FIVEM_BRIDGE_TOKEN in your web platform .env
Config.BridgeApiKey = GetConvar('prime_bridge_token', 'CHANGE_THIS_TO_YOUR_FIVEM_BRIDGE_TOKEN')

-- Sync interval in milliseconds (default: 30 seconds)
Config.SyncInterval = 30000

-- Framework Auto-Detection: 'qbcore', 'esx', 'ox_core', or 'standalone'
Config.Framework = 'auto'
