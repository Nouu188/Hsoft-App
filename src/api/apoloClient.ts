import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getBaseUrl = (port: number) => {
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}`;
  } else {
    // Đối với iOS và các nền tảng khác, localhost hoạt động bình thường
    return `http://localhost:${port}`;
  }
};

const ACCOUNT_SERVICE_URI = `${getBaseUrl(3001)}/graphql`;
const SCHEDULING_SERVICE_URI = `${getBaseUrl(3002)}/graphql`;
const NOTIFICATION_SERVICE_URI = `${getBaseUrl(3003)}/graphql`;
const APPOINTMENT_SERVICE_URI = `${getBaseUrl(3004)}/graphql`;

const httpLinkAccount = createHttpLink({ uri: ACCOUNT_SERVICE_URI });
const httpLinkScheduling = createHttpLink({ uri: SCHEDULING_SERVICE_URI });
const httpLinkNotification = createHttpLink({ uri: NOTIFICATION_SERVICE_URI });
const httpLinkAppointment = createHttpLink({ uri: APPOINTMENT_SERVICE_URI });

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const accountClient = new ApolloClient({
  link: authLink.concat(httpLinkAccount),
  cache: new InMemoryCache(),
});

export const schedulingClient = new ApolloClient({
  link: authLink.concat(httpLinkScheduling),
  cache: new InMemoryCache(),
});

export const notificationClient = new ApolloClient({
  link: authLink.concat(httpLinkNotification),
  cache: new InMemoryCache(),
});

export const appointmentClient = new ApolloClient({
  link: authLink.concat(httpLinkAppointment),
  cache: new InMemoryCache(),
});