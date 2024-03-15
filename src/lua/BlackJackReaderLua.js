const BlackJackReaderLua = {
name: "BlackJack Reader",
description: "Prints out easy to read messages you receive from the official Black Jack process.",
lua: `
BlackJack = "Vo7O7WJ2OPlKBtudjfeOdzjcjpi_-V_RLE27VpZP8jA"
Handlers.add(
    "BlackJackReader",
    Handlers.utils.hasMatchingTag("From-Process", BlackJack),
    function(msg)
        print(msg.Data)
    end
)
`}
export default BlackJackReaderLua