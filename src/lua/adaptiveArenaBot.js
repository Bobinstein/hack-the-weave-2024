const adaptiveArenaBot = {
    name: "Adaptive Arena Bot",
    description: "An Arena bot that changes its behavior based on the actions of other players",
    lua: `
    AdaptiveGameProcess = "gG-uz2w6qCNYWQGwocOh225ccJMj6fkyGDSKDS2K_nk"

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

function decideNextAction()
    local player = LatestGameState.Players[ao.id]
    local closestPlayer, targetX, targetY, distance, targetHealth = findClosestPlayer()

    -- Adapt strategy based on current state
    if player.health > 75 and player.energy > 50 then
        -- More aggressive if high health and reasonable energy
        if distance <= 3 then
            print(colors.yellow .. "Healthy and energized, attacking closest player." .. colors.reset)
            ao.send({Target = AdaptiveGameProcess, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(math.min(player.energy, targetHealth))})
        else
            print(colors.blue .. "Moving towards enemy for potential attack." .. colors.reset)
            determineMoveDirection(player.x, player.y, targetX, targetY, false)  -- Move towards enemy
        end
    elseif player.health <= 75 or player.energy <= 20 then
        -- More defensive if low health or low energy
        print(colors.blue .. "Low health or energy, avoiding conflict." .. colors.reset)
        determineMoveDirection(player.x, player.y, targetX, targetY, true)  -- Move away from enemy
    else
        -- Default behavior, cautious approach
        if distance <= 3 and player.energy > 30 then
            print(colors.yellow .. "Cautiously attacking." .. colors.reset)
            ao.send({Target = AdaptiveGameProcess, Action = "PlayerAttack", Player = ao.id, AttackEnergy = "30"})  -- Cautious attack
        else
            print(colors.blue .. "Maintaining safe distance." .. colors.reset)
            determineMoveDirection(player.x, player.y, targetX, targetY, true)
        end
    end
    InAction = false
end

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
    ao.send({Target = AdaptiveGameProcess, Action = "PlayerMove", Player = ao.id, Direction = bestDirection})
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
      ao.send({Target = AdaptiveGameProcess, Action = "GetGameState"})
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
      ao.send({Target = AdaptiveGameProcess, Action = "GetGameState"})
    end
  end
)

Handlers.add(
  "AutoPay",
  Handlers.utils.hasMatchingTag("Action", "AutoPay"),
  function ()
    print(colors.yellow .. "Auto-paying confirmation fees." .. colors.reset)
    ao.send({ Target = AdaptiveGameProcess, Action = "Transfer", Recipient = AdaptiveGameProcess, Quantity = "1000"})
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
    if playerHealth < 50 and playerEnergy > 30 then
      print(colors.magenta .. "Low health, counter-attacking." .. colors.reset)
      ao.send({Target = AdaptiveGameProcess, Action = "PlayerAttack", Player = ao.id, AttackEnergy = "30"})
    end
  end
)

    `
}

export default adaptiveArenaBot