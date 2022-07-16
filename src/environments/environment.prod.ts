const appSetting = require('../../package.json');

export const AppConfig = {
  version: appSetting.version,
  production: true,
  test: false,
  clientId: 'dda4282bac3cac95148b', // Client ID sent to heroku gateway
  githubUrl: 'https://github.com',
  accessTokenUrl: 'https://catcher-auth.herokuapp.com/authenticate',
  clientDataUrl: 'https://raw.githubusercontent.com/CATcher-org/client_data/master/profiles.json',
  origin: 'https://catcher-org.github.io'
};
