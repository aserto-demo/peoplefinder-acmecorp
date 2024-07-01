// workaround: require config-netlify to make sure it gets added to the netlify bundle
var env = require('dotenv').config()
require('dotenv-expand').expand(env)

const appPort = process.env.SERVER_PORT || 3000;
const instanceName =  process.env.POLICY_INSTANCE_NAME;

module.exports = {
  policyRoot: process.env.REACT_APP_POLICY_ROOT || 'peoplefinder',
  instanceName,
  instanceLabel: process.env.POLICY_INSTANCE_LABEL || instanceName,
  authorizerServiceUrl: process.env.AUTHORIZER_SERVICE_URL || `authorizer.prod.aserto.com:8443`,
  authorizerApiKey: process.env.AUTHORIZER_API_KEY,
  authorizerCertCAFile: process.env.AUTHORIZER_CERT_CA_FILE,
  directoryServiceUrl: process.env.DIRECTORY_SERVICE_URL || `directory.prod.aserto.com:8443`,
  directoryApiKey: process.env.DIRECTORY_API_KEY,
  directoryCertCAFile: process.env.DIRECTORY_CERT_CA_FILE,
  tenantId: process.env.TENANT_ID,

  jwksUri: `https://${process.env.REACT_APP_DEX_DOMAIN ?? 'acmecorp.demo.aserto.com'}/dex/keys`,
  issuer: `https://${process.env.REACT_APP_DEX_DOMAIN ?? 'acmecorp.demo.aserto.com'}/dex`,
  audience: process.env.REACT_APP_DEX_AUDIENCE || 'acmecorp-app',

  port: process.env.API_PORT || 3001,
  appPort,
  appOrigin: process.env.APP_ORIGIN || `http://localhost:${appPort}`,
}
