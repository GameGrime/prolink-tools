import {useEffect, useState} from 'react';
import {io} from 'socket.io-client';

import {connectToAppStore} from 'src/shared/api/client';
import {AppStore} from 'src/shared/store';
import {ApiClientSocket, ApiExternalClientSocket} from 'src/shared/websockeTypes';
import {apiBaseUrl} from 'src/utils/urls';

/**
 * AppKeyResolver is used to resolve the appKey once the websocket has been
 * established with the API server.
 *
 * This is useful if you need to make an RPC call to translate a different key
 * to an appKey.
 */
type AppKeyResolver = (ws: ApiClientSocket) => string | Promise<string>;

/**
 * Simply passes an app key through to use for connecting the store
 */
export const simpleAppKeyResolver = (appKey: string) => (_ws: ApiClientSocket) => appKey;

/**
 * Resolve the appKey from an overlayKey
 */
export const overlayAppKeyResolver = (overlayKey: string) => (ws: ApiClientSocket) =>
  new Promise<string>(resolve => ws.emit('appKey:by-overlay-key', overlayKey, resolve));

/**
 * Hook to retrieve a connected AppStore.
 */
export function useWebsocketStore(resolver: AppKeyResolver) {
  const [store, setStore] = useState<AppStore | null>(null);
  const [appWs, setAppWs] = useState<ApiExternalClientSocket | null>(null);

  const connectStore = async () => {
    const ws: ApiClientSocket = io(apiBaseUrl);
    const appKey = await resolver(ws);
    ws.close();

    const [connectedStore, connectedWs] = connectToAppStore(appKey);

    setAppWs(connectedWs);
    setStore(connectedStore);
  };

  useEffect(() => void connectStore(), []);

  return [store, appWs] as const;
}
