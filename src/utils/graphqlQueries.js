// src/utils/graphqlQueries.js

export const fetchProcessTransactionsQuery = (address) => {
    return `{
      transactions(
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
  