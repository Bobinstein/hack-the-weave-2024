const aliasLua = {
    name: "alias",
    description: "random collection of testing code",
    lua: `-- Correcting the handler addition to match expected signature

-- Assuming Send, Handlers, and ao are defined in your environment

-- Placeholder for the CRED token address
CRED_ = "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"

local _CredBalance = _CredBalance or {value = "Not checked yet"}

-- Function to evaluate if a message should trigger the handler
local function isCredBalanceMessage(msg)
    for _, tag in ipairs(msg.TagArray or {}) do
        if tag.name == "From-Process" and tag.value == CRED then
            return 1 -- continue, indicating this handler should process the message
        end
    end
    return 0 -- skip, indicating this message should not trigger the handler
end

-- Metatable setup remains the same
local credBalanceMeta = {
    __index = function(t, key)
        if key == "update" then
            Send({Target = CRED, Action = "Balance", Tags = {Target = ao.id}})
            return "Balance update requested."
        elseif key == "value" then
            return _CredBalance.value
        else
            return nil
        end
    end,
    __newindex = function(t, key, value)
        if key == "value" then
            _CredBalance.value = value
        end
    end
}

CredBalance = setmetatable({}, credBalanceMeta)

-- Updated handler addition
Handlers.add(
    "UpdateCredBalance",
    isCredBalanceMessage,
    function(msg)
        local balance = nil
        for _, tag in ipairs(msg.TagArray) do
            if tag.name == "Balance" then
                balance = tag.value
                break
            end
        end
        if balance then
            _CredBalance.value = balance
            print("CRED Balance updated: " .. _CredBalance.value)
        else
            print("Balance information not found in the message.")
        end
    end
)

-- Usage remains the same

-- Usage:
-- To request a balance update, access CredBalance.update.
-- The updated balance can then be retrieved via CredBalance.value.
`}

export default aliasLua