import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL của các microservice GraphQL
const ACCOUNT_SERVICE_URI = 'http://localhost:3001/graphql';
const SCHEDULING_SERVICE_URI = 'http://localhost:3002/graphql';
const httpLinkAccount = createHttpLink({ uri: ACCOUNT_SERVICE_URI });
const httpLinkScheduling = createHttpLink({ uri: SCHEDULING_SERVICE_URI });

// Middleware để tự động thêm token vào header
const authLink = setContext(async (_, { headers }) => {
  // Lấy token từ AsyncStorage (sẽ được lưu sau khi đăng nhập)
  const token = await AsyncStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Tạo các client riêng biệt
export const accountClient = new ApolloClient({
  link: authLink.concat(httpLinkAccount),
  cache: new InMemoryCache(),
});

export const schedulingClient = new ApolloClient({
  link: authLink.concat(httpLinkScheduling),
  cache: new InMemoryCache(),
});