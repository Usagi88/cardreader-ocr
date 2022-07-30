import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {WebSocketLink} from 'apollo-link-ws';
import {createClient} from 'graphql-ws';
import {setContext} from 'apollo-link-context';
import {getMainDefinition} from 'apollo-utilities';
import {createUploadLink} from 'apollo-upload-client';

import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  split,
  createHttpLink,
} from '@apollo/client';
import {onError} from 'apollo-link-error';
import {REACT_APP_API_URL, REACT_APP_WEBSOCKET_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

function createApolloClient(uri: string | undefined) {
  const link = createUploadLink({
    uri,
    credentials: 'same-origin',
  })

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('token');

      if (value !== null) {
        // value previously stored
        return value;
      }
    } catch (e) {
      // error reading value
    }
  };

  const token = getData();
  let activeSocket: any;
  let timedOut: any;
  const wsLink = new GraphQLWsLink(
    createClient({
      url: REACT_APP_WEBSOCKET_URL ?? 'ws://localhost:4000/graphql',
      connectionParams: {
        authToken: token ? `Bearer ${token}` : '',
      },
    }),
  );

  const authLink: any = setContext((_, {headers}) => {
    const token = getData();
    //const token = storage.getString('fahipayOCRs-token');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const errorLink: any = onError(({graphQLErrors, networkError}) => {
    if (graphQLErrors) {
      graphQLErrors.map(({message, locations, path}) =>
        // eslint-disable-next-line no-console
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    }
    // eslint-disable-next-line no-console
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  const splitLink = split(
    ({query}) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    authLink.concat(link),
  );

  return new ApolloClient({
    link: ApolloLink.from([errorLink, splitLink]),
    cache: new InMemoryCache(),
  });
}

export const apolloClient = createApolloClient(REACT_APP_API_URL);
