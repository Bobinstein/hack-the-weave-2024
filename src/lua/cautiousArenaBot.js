const cautiousArenaBot = {
    name: "Cautious Arena Bot",
    description: "An Arena bot that will try to stay out of harms way, unless it sees an opportunity to eliminate a player in one hit.",
    lua: `
    Game = "gG-uz2w6qCNYWQGwocOh225ccJMj6fkyGDSKDS2K_nk"
    -- Initializing global variables to store the latest game state and game host process.
    LatestGameState = LatestGameState or nil
    InAction = InAction or false
    
    -- Logging and color setup for debug and console outputs
    Logs = Logs or {}
    colors = {
      red = "\\27[31m",
      green = "\\27[32m",
      blue = "\\27[34m",
      yellow = "\\27[33m",
      magenta = "\\27[35m",
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
    
    -- Finds the closest player and returns their info including health
    function findClosestPlayer()
        local player = LatestGameState.Players[ao.id]
        local closestPlayer = nil
        local minDistance = math.huge
        local targetX, targetY, targetHealth
    
        for id, state in pairs(LatestGameState.Players) do
            if id ~= ao.id then
                local distance = getDistance(player.x, player.y, state.x, state.y)
                if distance < minDistance then
                    closestPlayer = id
                    minDistance = distance
                    targetX, targetY = state.x, state.y
                    targetHealth = state.health
                end
            end
        end
    
        return closestPlayer, targetX, targetY, minDistance, targetHealth
    end
    
    -- Decides the next action based on the proximity of the closest player and their health
    function decideNextAction()
        local player = LatestGameState.Players[ao.id]
        local closestPlayer, targetX, targetY, distance, targetHealth = findClosestPlayer()
    
        -- Check if the bot has enough energy to eliminate the closest player
        if player.energy >= targetHealth and distance <= 3 then  -- Assuming attack range is 3
            print(colors.yellow .. "Enough energy to eliminate closest player. Attacking." .. colors.reset)
            ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(player.energy)})
        else
            print(colors.blue .. "Avoiding players or insufficient energy to attack. Moving away." .. colors.reset)
            local moveDirection = determineMoveDirection(player.x, player.y, targetX, targetY, true)
            ao.send({Target = Game, Action = "PlayerMove", Player = ao.id, Direction = moveDirection})
        end
        InAction = false
    end
    
    -- Determines the best move direction to either approach or avoid the target
    function determineMoveDirection(x1, y1, x2, y2, avoid)
        local directions = {"Up", "Down", "Left", "Right"}
        local bestDirection = directions[math.random(#directions)]
        local maxDistance = avoid and 0 or math.huge
    
        for _, direction in ipairs(directions) do
            local newX, newY = x1, y1
            if direction == "Up" then newY = y1 - 1
            elseif direction == "Down" then newY = y1 + 1
            elseif direction == "Left" then newX = x1 - 1
            elseif direction == "Right" then newX = x1 + 1
            end
    
            local distance = getDistance(newX, newY, x2, y2)
            if avoid and distance > maxDistance or not avoid and distance < maxDistance then
                maxDistance = distance
                bestDirection = direction
            end
        end
    
        return bestDirection
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
        print(colors.yellow .. "Auto-paying confirmation fees." .. colors.reset)
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
        local playerHealth = LatestGameState.Players[ao.id].health
        if playerEnergy >= 50 and playerHealth <= 50 then  -- Attack only if it has enough energy and low health
          print(colors.magenta .. "In danger and have enough energy. Returning attack." .. colors.reset)
          ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(playerEnergy)})
        end
      end
    )
    `
}

export default cautiousArenaBot