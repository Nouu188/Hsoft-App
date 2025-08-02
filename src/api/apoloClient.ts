// src/api/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; // <-- Import Platform

// --- GIẢI PHÁP DỨT ĐIỂM ---
// Xác định base URL dựa trên nền tảng
const getBaseUrl = (port: number) => {
  if (Platform.OS === 'android') {
    // Đối với máy ảo Android, 10.0.2.2 là địa chỉ của máy host
    return `http://10.0.2.2:${port}`;
  } else {
    // Đối với iOS và các nền tảng khác, localhost hoạt động bình thường
    return `http://localhost:${port}`;
  }
};

const ACCOUNT_SERVICE_URI = `${getBaseUrl(3001)}/graphql`;
const SCHEDULING_SERVICE_URI = `${getBaseUrl(3002)}/graphql`;
// ==========================

// Tạo các "đường dẫn" HTTP riêng cho mỗi service
const httpLinkAccount = createHttpLink({ uri: ACCOUNT_SERVICE_URI });
const httpLinkScheduling = createHttpLink({ uri: SCHEDULING_SERVICE_URI });

// Middleware để tự động thêm token vào header (không đổi)
const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Tạo các client riêng biệt (không đổi)
export const accountClient = new ApolloClient({
  link: authLink.concat(httpLinkAccount),
  cache: new InMemoryCache(),
});

export const schedulingClient = new ApolloClient({
  link: authLink.concat(httpLinkScheduling),
  cache: new InMemoryCache(),
});