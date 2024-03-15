const gameUtils = {
    name: "Game Utilities",
    description: "Simplifies Game commands like register, pay, and get game state.",
    lua: `GAME_PROCESS = "gG-uz2w6qCNYWQGwocOh225ccJMj6fkyGDSKDS2K_nk"

    _GAME = { state = "Game state has not been checked yet. Updating now." }
    
    local gameMeta = {
        __index = function(t, key)
            -- sends Game registration request
            if key == "register" then
                Send({ Target = GAME_PROCESS, Action = "Register" })
                return "Game registration requested."
            -- sends Game state request
            elseif key == "state" then
                Send({ Target = GAME_PROCESS, Action = "GetGameState" })
                return _GAME.state
            -- sends tick command to Game
            elseif key == "tick" then
                Send({ Target = GAME_PROCESS, Action = "Tick" })
                return "Game tick requested."
            -- transfers funds to Game
            elseif key == "pay" then
                print("Paying 1000 to Game")
                Send({ Target = GAME_PROCESS, Action = "Transfer", Recipient = GAME_PROCESS, Quantity = "1000" })
                return "Payment of 1000 to Game requested."
            elseif key == "fund" then
                print("Requesting game tokens.")
                Send({ Target = Game, Action = "RequestTokens"})
                return "Tokens have been requested"
            else
                return nil
            end
        end
    }
    
    GAME = setmetatable({}, gameMeta)
    
    `
}


export default gameUtils