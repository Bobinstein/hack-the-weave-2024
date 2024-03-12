// Assuming aliasLua.js, BlackJackLua.js, and BlackJackReaderLua.js are in the same folder as exports.js

// Import the default exports from each of the .js files
import aliasLua from './aliasLua';
import BlackJackLua from './BlackJackLua';
import BlackJackReaderLua from './BlackJackReaderLua';



const luaArray = [aliasLua, BlackJackLua, BlackJackReaderLua,]
// Re-export them as named exports
export default luaArray

export { aliasLua, BlackJackLua, BlackJackReaderLua,  };
