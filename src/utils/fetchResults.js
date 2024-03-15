import { results } from "@permaweb/aoconnect";

export const fetchResults = async (processId, fromCursor, setMessages, setCursor, setCanLoadMore, messages) => {
    const queryOptions = {
        process: processId,
        sort: "DESC",
        limit: 25,
    };

    if (fromCursor) {
        queryOptions.from = fromCursor;
    }

    const resultsOut = await results(queryOptions);
    let filteredMessages = resultsOut.edges
        .map((edge) => edge.node)
        .filter((node) => node.Messages && node.Messages.length > 0 && node.Messages[0].Data);

    console.log('filtered messages: ', filteredMessages);

    // Assuming each message has a unique 'id' property
    if (fromCursor) {
        // Exclude messages that are already in the state
        filteredMessages = filteredMessages.filter((newMsg) => !messages.some((msg) => msg.id === newMsg.id));
        setMessages((prev) => [...prev, ...filteredMessages]);
    } else {
        setMessages([...filteredMessages]);
    }

    const newCursor = resultsOut.edges?.[resultsOut.edges.length - 1]?.cursor ?? null;
    setCursor(newCursor);
    setCanLoadMore(filteredMessages.length > 0 && messages.length < 100);
};
