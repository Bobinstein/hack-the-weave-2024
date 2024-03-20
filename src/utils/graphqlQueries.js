// src/utils/graphqlQueries.js

export const fetchProcessTransactionsQuery = (address) => {
    return `{
      transactions(
        first: 100
        owners: ["${address}"]
        tags: [
          { name: "Type", values: ["Process"] }
        ]
      ) {
        edges {
          node {
            id
            owner {
              address
            }
            tags {
              name
              value
            }
            data {
              size
              type
            }
          }
        }
      }
    }`;
  };
  