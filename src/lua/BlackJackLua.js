const BlackJackLua = {
    
    
    name: "BlackJack",
    description: "Run a BlackJack game that uses CRED tokens from your process ID",
    lua: `

math.randomseed(os.time()) -- Seed the random number generator
CRED = "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"

gameStates = gameStates or {}
houseBalance = houseBalance or nil
-- Function to create a new deck of cards
function createDeck()
    local suits = { "Hearts", "Diamonds", "Clubs", "Spades" }
    local values = { "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" }
    local deck = {}
    for _, suit in ipairs(suits) do
        for _, value in ipairs(values) do
            table.insert(deck, { value = value, suit = suit })
        end
    end
    return deck
end

-- Function to shuffle the deck
function shuffleDeck(deck)
    for i = #deck, 2, -1 do
        local j = math.random(i)
        deck[i], deck[j] = deck[j], deck[i]
    end
end

-- Function to deal cards from the deck
function dealCards(deck, numCards)
    local cards = {}
    for i = 1, numCards do
        table.insert(cards, table.remove(deck))
    end
    return cards
end

-- Initialize a game state for a player
function addPlayerGameState(playerName)
    local deck = createDeck()
    shuffleDeck(deck)
    local playerCards = dealCards(deck, 2)
    local dealerCards = dealCards(deck, 2)

    gameStates[playerName] = {
        playerCards = playerCards,
        dealerCards = dealerCards,
        dealerCardShown = false,
        deck = deck
    }
end

function endGame(playerName)
    Send({ Target = CRED, Action = "Balance", Tags = { Target = ao.id } })
    -- Check if the game state for the player exists
    if gameStates[playerName] then
        -- Remove the player's game state by setting it to nil
        gameStates[playerName] = nil
        print(playerName .. "'s game has ended and their state has been removed.")
    else
        print("No game state found for " .. playerName .. ".")
    end
end

-- Function to evaluate if a message should trigger the handler
local function isCredBalanceMessage(msg)
    if msg.From == CRED and msg.Tags.Balance then
        print("This is a cred balance message")
        return true
    else
        return false
    end
end

local function isNewBetMessage(msg)
    if msg.From == CRED and msg.Sender then
        print("This is a new bet message")
        return true
    else
        return false
    end
end

function getGameState(playerName)
    local gameState = gameStates[playerName]
    if not gameState then
        print("Game state for player " .. playerName .. " does not exist.")
        return nil
    else
        -- Copy the gameState to avoid modifying the original
        local gameStateCopy = {
            playerCards = gameState.playerCards, -- Player's cards are always fully visible
            dealerCards = {},                    -- Will be populated based on dealerCardShown flag
            dealerCardShown = gameState.dealerCardShown,
            deck = gameState.deck                -- You might not need to return the deck depending on your game logic
        }

        if gameState.dealerCardShown then
            -- If dealerCardShown is true, return all dealer's cards
            gameStateCopy.dealerCards = gameState.dealerCards
        else
            -- If dealerCardShown is false, return only the second dealer's card
            -- Assumes there are at least two cards dealt to the dealer
            gameStateCopy.dealerCards[1] = gameState.dealerCards[2]
        end

        return gameStateCopy
    end
end

Handlers.add(
    "CredBalance",
    isCredBalanceMessage,
    function(msg)
        print("Updating house balance, new balance is " .. msg.Tags.Balance)
        houseBalance = msg.Tags.Balance
    end
)

Handlers.add(
    "NewBet",
    isNewBetMessage,
    function(msg)
        Send({ Target = CRED, Action = "Balance", Tags = { Target = ao.id } })
        print(msg.Tags.Sender .. " is attempting to start a game.")
        -- if houseBalance > "3000" then
        print("There is enough money in the bank")
        -- Start a new game if the bet amount is correct
        if msg.Tags.Quantity == "1000" then
            -- Check for an existing game
            if gameStates[msg.Tags.Sender] then
                print { "Game already going" }
                -- Inform the player that a game is already in progress
                Send({ Target = CRED, Action = "Transfer", Recipient = msg.Tags.Sender, Quantity = msg.Tags.Quantity })
                Send({
                    Target = msg.Tags.Sender,
                    Action = "BlackJackMessage",
                    Data = "You already have an active game. You must finish it before starting a new one."
                })
            else
                addPlayerGameState(msg.Tags.Sender)
                print(msg.Tags.Sender .. " has started a game.")
                -- Send the game state to the player
                sendGameStateMessage(msg.Tags.Sender)
            end
        else
            print("Incorrect bet")
            -- Return the bet if it's not the correct amount
            Send({ Target = CRED, Action = "Transfer", Recipient = msg.Tags.Sender, Quantity = msg.Tags.Quantity })
            Send({
                Target = msg.Tags.Sender,
                Action = "BlackJackMessage",
                Data = "We only support bets of 1000 CRED Units at this time, your bet has been returned to you"
            })
        end
        -- else
        --     print("We are broke")
        --     Send({ Target = CRED, Action = "Transfer", Recipient = msg.Tags.Sender, Quantity = msg.Tags.Quantity })
        --     Send({
        --         Target = msg.Tags.Sender,
        --         Action = "BlackJackMessage",
        --         Data =
        --         "Oops, it looks like we cant cover your bet. Your CRED has been returned to you."
        --     })
        -- end
    end
)

function sendGameStateMessage(playerName)
    local state = getGameState(playerName)
    if state then
        -- Stringify the player's and dealer's cards
        local playerCardsString = stringifyCards(state.playerCards)
        local dealerCardsString = stringifyCards(state.dealerCards)

        -- Prepare and send the game state message to the player
        local message = "Your cards are: " .. playerCardsString .. ". And the dealer is showing: " .. dealerCardsString
        Send({ Target = playerName, Action = "BlackJackMessage", Data = message })
    else
        -- Handle the case where there is no active game for the player
        Send({
            Target = playerName,
            Action = "BlackJackMessage",
            Data =
            "You have no active game, start one by sending 1000 CRED units to this process"
        })
    end
end

function stringifyCards(cards)
    local cardStrings = {}
    for _, card in ipairs(cards) do
        table.insert(cardStrings, card.value .. " of " .. card.suit)
    end
    return table.concat(cardStrings, ", ")
end

Handlers.add(
    "showState",
    Handlers.utils.hasMatchingTag("Action", "showState"),
    function(msg)
        sendGameStateMessage(msg.From)
    end
)



-- A helper function to calculate the total value of a hand, considering Aces as 1 or 11
function calculateHandValue(hand)
    local total = 0
    local aces = 0

    for _, card in ipairs(hand) do
        local value = card.value
        if value == "J" or value == "Q" or value == "K" then
            total = total + 10
        elseif value == "A" then
            aces = aces + 1
            total = total + 11 -- Consider Ace as 11 initially
        else
            total = total + tonumber(value)
        end
    end

    -- Adjust for Aces if total is over 21
    while total > 21 and aces > 0 do
        total = total - 10 -- Change one Ace from 11 to 1
        aces = aces - 1
    end

    return total
end

function dealerDraw(playerName)
    local gameState = gameStates[playerName]
    if not gameState then
        print("Game state for player " .. playerName .. " does not exist.")
        return
    end

    -- Ensure the dealer's second card is shown
    gameState.dealerCardShown = true

    local playerHandValue = calculateHandValue(gameState.playerCards)
    local dealerHandValue = calculateHandValue(gameState.dealerCards)

    -- Dealer draws cards according to modified Vegas rules, taking player's hand into account
    while dealerHandValue < 17 and dealerHandValue < playerHandValue do
        if playerHandValue > 21 then
            -- If the player has busted, the dealer stops drawing
            break
        end

        local card = table.remove(gameState.deck)                   -- Draw the top card from the deck
        table.insert(gameState.dealerCards, card)                   -- Add the drawn card to the dealer's hand
        dealerHandValue = calculateHandValue(gameState.dealerCards) -- Recalculate dealer's hand value after drawing
    end

    -- Determine the game's outcome
    local resultMessage
    if playerHandValue > 21 then
        resultMessage = "Busted! Your hand value exceeded 21. You lose."
    elseif dealerHandValue > 21 or playerHandValue > dealerHandValue then
        resultMessage = "Winner Winner Chicken Dinner!!!! (as long as you spend that CRED on a chicken dinner)"
        Send({ Target = CRED, Action = "Transfer", Recipient = playerName, Quantity = "2000" })
    elseif dealerHandValue > playerHandValue then
        resultMessage = "Dealer wins. Better luck next time."
    else -- dealerHandValue == playerHandValue
        resultMessage = "It's a Push!"
        Send({ Target = CRED, Action = "Transfer", Recipient = playerName, Quantity = "1000" })
    end

    -- Send the result to the player
    sendGameStateMessage(playerName)
    Send({ Target = playerName, Action = "BlackJackMessage", Data = resultMessage })

    -- Optionally, handle end of game, like clearing the game state
    print(resultMessage)
    endGame(playerName)
end

Handlers.add(
    "Hit",
    Handlers.utils.hasMatchingTag("Action", "Hit"),
    function(msg)
        if not gameStates[msg.From] then
            -- No active game for this user
            Send({ Target = msg.From, Action = "BlackJackMessage", Data =
            "You have no active game. Start one by placing a bet." })
        else
            -- Active game exists, proceed with drawing a card
            local gameState = gameStates[msg.From]
            local newCard = table.remove(gameState.deck) -- Draw the top card from the deck
            table.insert(gameState.playerCards, newCard) -- Add the new card to the player's hand

            local playerHandValue = calculateHandValue(gameState.playerCards)

            if playerHandValue == 21 then
                Send({ Target = msg.From, Action = "BlackJackMessage", Data = "21! Dealer's draw" })
                dealerDraw(msg.From)
            end

            if playerHandValue > 21 then
                -- Player has busted
                gameStates[msg.From].dealerCardShown = true
                sendGameStateMessage(msg.From)
                Send({ Target = msg.From, Action = "BlackJackMessage", Data =
                "Busted! Your hand value exceeded 21. Game over." })
                endGame(msg.From)
                -- Here you might also want to handle game over logic, like clearing the game state
            else
                -- Player has not busted, send the updated game state
                sendGameStateMessage(msg.From)
            end
        end
    end
)

Handlers.add(
    "Stay",
    Handlers.utils.hasMatchingTag("Action", "Stay"),
    function(msg)
        if not gameStates[msg.From] then
            -- No active game
            Send({ Target = msg.From, Action = "BlackJackMessage", Data =
            "You have no active game. Start one by placing a bet." })
        else
            dealerDraw(msg.From)
        end
    end
)
`
}
export default BlackJackLua