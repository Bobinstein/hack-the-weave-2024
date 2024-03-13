const aggressiveArenaBot = {
    name: "Agressive Arena Bot",
    description: "An Arena Bot that will aggressively attack other players",
    lua: `Game = "gG-uz2w6qCNYWQGwocOh225ccJMj6fkyGDSKDS2K_nk"

    -- Initializing global variables to store the latest game state and game host process.
    LatestGameState = LatestGameState or nil
    InAction = InAction or false
    
    -- Logging and color setup for debug and console outputs
    Logs = Logs or {}
    colors = {
      red = "\\27[31m",
      green = "\\27[32m",
      blue = "\\27[34m",
      yellow = "\\27[33m",  -- Added for bot's actions
      magenta = "\\27[35m", -- Added for hits taken
      reset = "\\27[0m",
      gray = "\\27[90m"
    }
    
    function addLog(msg, text)
      Logs[msg] = Logs[msg] or {}
      table.insert(Logs[msg], text)
    end
    
    function getDistance(x1, y1, x2, y2)
        return math.sqrt((x1 - x2)^2 + (y1 - y2)^2)
    end
    
    function findClosestPlayer()
        local player = LatestGameState.Players[ao.id]
        local closestPlayer = nil
        local minDistance = math.huge
        local targetX, targetY
    
        for id, state in pairs(LatestGameState.Players) do
            if id ~= ao.id then
                local distance = getDistance(player.x, player.y, state.x, state.y)
                if distance < minDistance then
                    closestPlayer = id
                    minDistance = distance
                    targetX, targetY = state.x, state.y
                end
            end
        end
    
        return closestPlayer, targetX, targetY, minDistance
    end
    
    function determineMoveDirection(x1, y1, x2, y2)
        local moveX = x1 < x2 and "Right" or x1 > x2 and "Left" or ""
        local moveY = y1 < y2 and "Down" or y1 > y2 and "Up" or ""
        return moveY .. moveX
    end
    
    function decideNextAction()
        local player = LatestGameState.Players[ao.id]
        local closestPlayer, targetX, targetY, distance = findClosestPlayer()
    
        if player.energy > 5 and distance <= 1 then
            print(colors.yellow .. "Attacking closest player." .. colors.reset)  -- Changed to yellow
            ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(player.energy)})
        else
            print(colors.yellow .. "Moving towards closest player." .. colors.reset)  -- Changed to yellow
            local moveDirection = determineMoveDirection(player.x, player.y, targetX, targetY)
            ao.send({Target = Game, Action = "PlayerMove", Player = ao.id, Direction = moveDirection})
        end
        InAction = false
    end
    
    -- Handlers for game events
    Handlers.add(
      "PrintAnnouncements",
      Handlers.utils.hasMatchingTag("Action", "Announcement"),
      function (msg)
        print(colors.green .. msg.Event .. ": " .. msg.Data .. colors.reset)
        if msg.Event == "Started-Waiting-Period" then
          ao.send({Target = ao.id, Action = "AutoPay"})
        end
        if not InAction then
          InAction = true
          ao.send({Target = Game, Action = "GetGameState"})
        end
      end
    )
    
    Handlers.add(
      "GetGameStateOnTick",
      Handlers.utils.hasMatchingTag("Action", "Tick"),
      function ()
        if not InAction then
          InAction = true
          print(colors.gray .. "Getting game state..." .. colors.reset)
          ao.send({Target = Game, Action = "GetGameState"})
        end
      end
    )
    
    Handlers.add(
      "AutoPay",
      Handlers.utils.hasMatchingTag("Action", "AutoPay"),
      function ()
        print(colors.yellow .. "Auto-paying confirmation fees." .. colors.reset)  -- Changed to yellow
        ao.send({ Target = Game, Action = "Transfer", Recipient = Game, Quantity = "1000"})
      end
    )
    
    Handlers.add(
      "UpdateGameState",
      Handlers.utils.hasMatchingTag("Action", "GameState"),
      function (msg)
        local json = require("json")
        LatestGameState = json.decode(msg.Data)
        decideNextAction()
      end
    )
    
    Handlers.add(
      "decideNextAction",
      Handlers.utils.hasMatchingTag("Action", "UpdatedGameState"),
      decideNextAction
    )
    
    Handlers.add(
      "ReturnAttack",
      Handlers.utils.hasMatchingTag("Action", "Hit"),
      function (msg)
        local playerEnergy = LatestGameState.Players[ao.id].energy
        if playerEnergy > 5 then
          print(colors.magenta .. "Returning attack." .. colors.reset)  -- Changed to magenta
          ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(playerEnergy)})
        end
      end
    )
    `
}

export default aggressiveArenaBot