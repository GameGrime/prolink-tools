import * as Sentry from '@sentry/node';
import '@sentry/apm';
import os from 'os';
import publicIp from 'public-ip';

import {dsn} from './dsn';

let userInfo: undefined | Promise<Sentry.User>;

async function loadUserInfo() {
  const user: Sentry.User = {
    username: os.userInfo().username,
    ip_address: await publicIp.v4(),
  };

  return user;
}

Sentry.init({
  dsn,
  release: process.env.RELEASE,
  environment: process.env.RELEASE_CHANNEL,
  sampleRate: 1,
  tracesSampleRate: 1,
});

(async () => {
  userInfo = loadUserInfo();
  Sentry.setUser(await userInfo);
})();

/**
 * Export user info to be bubbled up to the renderer
 */
export {userInfo};
