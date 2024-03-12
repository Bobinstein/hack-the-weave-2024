const LuaOption = ({ script, processId, onLoad }) => {
  const handleClick = () => {
    onLoad(processId, script.lua);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: "pointer",
        margin: "10px",
        padding: "10px",
        border: "1px solid #ddd",
      }}
    >
      <strong>{script.name}</strong>
      <p>{script.description}</p>
    </div>
  );
};

export default LuaOption;
