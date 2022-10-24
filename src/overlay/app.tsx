import 'regenerator-runtime/runtime';
import 'src/shared/sentry/web';

import {render} from 'react-dom';
import {io} from 'socket.io-client';

import Router from 'overlay/Router';
import {createAppStore} from 'src/shared/store';
import {registerWebsocketListener} from 'src/shared/store/client';
import {StoreContext} from 'src/shared/store/context';
import {AppOverlayClientSocket} from 'src/shared/websockeTypes';

const overlaysStore = createAppStore();

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const main = (
  <StoreContext.Provider value={overlaysStore}>
    <Router />
  </StoreContext.Provider>
);

render(main, mainElement);

registerWebsocketListener(overlaysStore, io() as AppOverlayClientSocket);
