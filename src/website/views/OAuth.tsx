import {useEffect, useState} from 'react';
import {AlertTriangle, Link} from 'react-feather';
import {useLocation} from 'react-router-dom';
import {useBoolean} from 'react-use';
import styled from '@emotion/styled';
import {observer} from 'mobx-react';

import Loading from 'src/shared/components/Loading';
import {AppStore} from 'src/shared/store';
import {ApiExternalClientSocket} from 'src/shared/websockeTypes';

type Props = {
  store: AppStore;
  appSocket: ApiExternalClientSocket;
};

export const OAuthConnect = observer(({store}: Props) => {
  const redirectUrl = store.cloudApiState.oauthState?.redirectUrl;

  useEffect(
    () => void (redirectUrl && window.location.replace(redirectUrl)),
    [redirectUrl]
  );

  if (!store.isInitalized) {
    return <Loading expand message="Connecting to App" />;
  }

  if (!redirectUrl) {
    return <Message>Activate the OAuth flow in the App</Message>;
  }

  return <Loading expand message="Redirecting" />;
});

export const OAuthAuthorize = observer(({store, appSocket}: Props) => {
  const oauthState = store.cloudApiState.oauthState;

  const params = new URLSearchParams(useLocation().search);
  const code = params.get('code');

  const [isDone, markDone] = useBoolean(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthorize = () => {
    if (oauthState === null || code === null) {
      return;
    }

    appSocket.emit(`oauth:authorize`, oauthState.provider, code, params => {
      markDone(true);
      setError(params.error);
    });
  };

  useEffect(handleAuthorize, [oauthState, code]);

  if (oauthState === null) {
    return (
      <Message>
        <AlertTriangle />
        <p>Whoops! There&apos;s no active account linking flow.</p>
        <small>
          Close this window and try restarting the linking flow from Prolink Tools
        </small>
      </Message>
    );
  }

  if (error !== null) {
    return (
      <Message>
        <AlertTriangle />
        <p>{error}</p>
      </Message>
    );
  }

  if (!isDone) {
    return <Loading expand message="Authorizing" />;
  }

  return (
    <Message>
      <Link />
      <p>
        <strong>Account linked!</strong>
      </p>
      <small>You may close this page and return to the Prolink Tools app</small>
    </Message>
  );
});

const Message = styled('section')`
  display: flex;
  max-width: 400px;
  flex-direction: column;
  align-self: center;
  justify-self: center;
  align-items: center;
  text-align: center;
`;
