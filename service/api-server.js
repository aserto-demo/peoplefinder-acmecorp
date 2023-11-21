var env = require('dotenv').config()
require('dotenv-expand').expand(env)

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { join } = require("path");

// establish whether we are hosted in Netlify
const isNetlify = process.env.NETLIFY || process.env.REACT_APP_NETLIFY;

// retrieve configuration
const {
  port,
  authorizerServiceUrl,
  policyRoot,
  instanceName,
  tenantId,
  authorizerCertCAFile,
  directoryServiceUrl
} = require('./src/config');

const app = express();
const router = express.Router();
const routerBasePath = isNetlify ? '/.netlify/functions/api-server' : '/';

app.use(morgan("dev"));
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({ origin: true }));
app.use(express.json());

// register the api handlers
const users = require('./src/users-api');
users.register(router);

// configure the router on the correct base path
app.use(routerBasePath, router);

// log some config values
console.log(`Authorizer: ${authorizerServiceUrl}`);
console.log(`Directory: ${directoryServiceUrl}`);
console.log(`Policy instance name: ${instanceName}`);
console.log(`Policy root: ${policyRoot}`);

if (tenantId) {
  console.log(`Tenant ID: ${tenantId}`);
}
if (authorizerCertCAFile) {
  console.log(`Authorizer Cert file: ${authorizerCertCAFile}`);
}

// make it work with netlify functions
if (isNetlify) {
  const serverless = require("serverless-http");
  const handler = serverless(app);
  exports.handler = async (event, context) => {
    return await handler(event, context);
  }
} else {
  // main endpoint serves react bundle from /build
  app.use(express.static(join(__dirname, '..', 'build')));

  // serve all /people client-side routes from the /build bundle
  app.get('/people*', function (req, res) {
    res.sendFile(join(__dirname, '..', 'build', 'index.html'));
  });

  app.listen(port, () => console.log(`API Server listening on port ${port}`));
}
