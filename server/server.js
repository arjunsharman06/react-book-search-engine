const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');
const { ApolloServer } = require('apollo-server-express');

// import resolvers and typeDefs
const { typeDefs, resolvers } = require('./schemas');

const PORT = process.env.PORT || 3001;

// create new apollo sever and pass schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create new instance of Apollo server with GraphQl Schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();

  // integrate our Apollo server with the Express application as middleware
  server.applyMiddleware({ app });

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      // GQL API Server link
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);
