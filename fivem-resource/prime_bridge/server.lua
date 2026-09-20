-- PRIME RP Server-Side Telemetry & Live Player Bridge
local QBCore = nil
local ESX = nil

Citizen.CreateThread(function()
    if Config.Framework == 'auto' or Config.Framework == 'qbcore' then
        if GetResourceState('qb-core') == 'started' then
            QBCore = exports['qb-core']:GetCoreObject()
            print('^2[Prime RP Bridge]^7 Successfully hooked into QBCore Framework.')
        end
    end

    if not QBCore and (Config.Framework == 'auto' or Config.Framework == 'esx') then
        if GetResourceState('es_extended') == 'started' then
            ESX = exports['es_extended']:getSharedObject()
            print('^2[Prime RP Bridge]^7 Successfully hooked into ESX Framework.')
        end
    end
end)

local function GetPlayerDiscordId(source)
    for _, id in ipairs(GetPlayerIdentifiers(source)) do
        if string.sub(id, 1, 8) == 'discord:' then
            return string.sub(id, 9)
        end
    end
    return nil
end

local function CollectLivePlayerData()
    local players = {}
    local rawPlayers = GetPlayers()

    for _, playerId in ipairs(rawPlayers) do
        local src = tonumber(playerId)
        local playerName = GetPlayerName(src)
        local ping = GetPlayerPing(src)
        local discordId = GetPlayerDiscordId(src)

        local charData = {
            id = src,
            name = playerName or ('Player #' .. src),
            ping = ping,
            identifiers = GetPlayerIdentifiers(src),
            discordId = discordId
        }

        if QBCore then
            local Player = QBCore.Functions.GetPlayer(src)
            if Player and Player.PlayerData then
                charData.citizenId = Player.PlayerData.citizenid
                charData.characterName = (Player.PlayerData.charinfo.firstname or '') .. ' ' .. (Player.PlayerData.charinfo.lastname or '')
                charData.job = Player.PlayerData.job.label or Player.PlayerData.job.name
                charData.grade = Player.PlayerData.job.grade.name
                charData.cash = Player.PlayerData.money.cash
                charData.bank = Player.PlayerData.money.bank
            end
        elseif ESX then
            local xPlayer = ESX.GetPlayerFromId(src)
            if xPlayer then
                charData.characterName = xPlayer.getName()
                charData.job = xPlayer.getJob().label
                charData.grade = xPlayer.getJob().grade_label
                charData.cash = xPlayer.getMoney()
                charData.bank = xPlayer.getAccount('bank') and xPlayer.getAccount('bank').money or 0
            end
        end

        table.insert(players, charData)
    end

    return players
end

local function SyncWithWebPlatform()
    local endpoint = Config.WebPlatformUrl .. '/api/fivem/bridge/sync'
    local activePlayers = #GetPlayers()
    local maxPlayers = GetConvarInt('sv_maxclients', 250)
    local serverName = GetConvar('sv_projectName', GetConvar('sv_hostname', 'PRIME RP'))

    local payload = {
        serverName = serverName,
        activePlayers = activePlayers,
        maxPlayers = maxPlayers,
        players = CollectLivePlayerData()
    }

    PerformHttpRequest(endpoint, function(statusCode, responseText, headers)
        if statusCode == 200 then
            -- Sync successful
        else
            print('^1[Prime RP Bridge Error]^7 HTTP Sync failed with status: ' .. tostring(statusCode) .. ' - ' .. tostring(responseText))
        end
    end, 'POST', json.encode(payload), {
        ['Content-Type'] = 'application/json',
        ['X-FiveM-Bridge-Token'] = Config.BridgeApiKey
    })
end

Citizen.CreateThread(function()
    print('^3[Prime RP Bridge]^7 Started. Web synchronization loop initialized.')
    while true do
        Citizen.Wait(Config.SyncInterval)
        SyncWithWebPlatform()
    end
end)
