import loadLua from "./loadLua";

export const handleLuaClick = async (luaScript, currentHash, setIsLoading) => {
  const processId = currentHash.replace('#process/', '');
  if (processId) {
    await loadLua(processId, luaScript.lua, setIsLoading);
  }
};
