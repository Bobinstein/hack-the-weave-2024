// Assuming aliasLua.js, BlackJackLua.js, and BlackJackReaderLua.js are in the same folder as exports.js

// Import the default exports from each of the .js files
// import aliasLua from './aliasLua';
import BlackJackLua from './BlackJackLua';
import BlackJackReaderLua from './BlackJackReaderLua';
import cautiousArenaBot from './cautiousArenaBot';
import aggressiveArenaBot from './aggressiveArenaBot';
import adaptiveArenaBot from './adaptiveArenaBot';
import guerillaArenaBot from './guerillaArenaBot';
import gameUtils from './gameUtils';


const luaArray = [BlackJackLua, BlackJackReaderLua, cautiousArenaBot, aggressiveArenaBot, adaptiveArenaBot, guerillaArenaBot, gameUtils]
// Re-export them as named exports
export default luaArray

export {BlackJackLua, BlackJackReaderLua,cautiousArenaBot, aggressiveArenaBot, adaptiveArenaBot, guerillaArenaBot, gameUtils  };
