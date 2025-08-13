import { create } from 'zustand';
import { notificationClient } from '@/api/apoloClient'; 
import { GET_MY_NOTIFICATION_HISTORY } from '@/api/queries/notificationQueries';
import { MARK_NOTIFICATIONS_AS_READ, DELETE_NOTIFICATION } from '@/api/mutations/notificationMutations';
import { 
  NotificationHistory, 
  NotificationType, 
  NotificationStatus 
} from '@/types';

interface NotificationState {
  notifications: NotificationHistory[];
  filteredNotifications: NotificationHistory[];
  activeFilter: NotificationType | 'ALL';
  isLoading: boolean;
  error: string | null;
  
  fetchNotifications: () => Promise<void>;
  setFilter: (filter: NotificationType | 'ALL') => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  filteredNotifications: [],
  activeFilter: 'ALL',
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    if (get().isLoading) {
      console.log('[NotificationStore] Skipped fetchNotifications: Already loading.');
      return;
    }
    console.log('[NotificationStore] Action: fetchNotifications called.');
    set({ isLoading: true, error: null });

    try {
      const { data } = await notificationClient.query({
        query: GET_MY_NOTIFICATION_HISTORY,
        variables: { offset: 0, limit: 100 },
        fetchPolicy: 'network-only',
      });

      const fetchedNotifications: NotificationHistory[] = data.myNotificationHistory || [];
      console.log(`[NotificationStore] API Success: Fetched ${fetchedNotifications.length} notifications.`);
      
      set({ notifications: fetchedNotifications, isLoading: false });
      get().setFilter(get().activeFilter); // Áp dụng lại bộ lọc
    } catch (e: any) {
      console.error('[NotificationStore] API Failure: fetchNotifications failed.', e);
      set({ error: e.message, isLoading: false });
    }
  },

  setFilter: (filter) => {
    console.log(`[NotificationStore] Action: setFilter called with filter: ${filter}`);
    const allNotifications = get().notifications;
    const filtered = filter === 'ALL'
      ? allNotifications
      : allNotifications.filter(n => n.type === filter);
    
    set({ activeFilter: filter, filteredNotifications: filtered });
    console.log(`[NotificationStore] State updated: ${filtered.length} notifications displayed.`);
  },

  markAsRead: async (notificationId) => {
    console.log(`[NotificationStore] Action: markAsRead called for ID: ${notificationId}`);
    const previousNotifications = get().notifications;

    // Optimistic Update
    set(state => {
      const updatedNotifications = state.notifications.map(n => 
        n.id === notificationId ? { ...n, status: NotificationStatus.READ } : n
      );
      console.log('[NotificationStore] Optimistic update: Marked one as read.');
      return { notifications: updatedNotifications };
    });
    get().setFilter(get().activeFilter);

    try {
      await notificationClient.mutate({
        mutation: MARK_NOTIFICATIONS_AS_READ,
        variables: { input: { notificationIds: [notificationId] } },
      });
      console.log(`[NotificationStore] API Success: Server confirmed notification ${notificationId} as read.`);
    } catch (e) {
      console.error(`[NotificationStore] API Failure: markAsRead for ${notificationId} failed. Rolling back.`, e);
      // Rollback
      set({ notifications: previousNotifications });
      get().setFilter(get().activeFilter);
      console.log('[NotificationStore] Rollback complete.');
    }
  },

  markAllAsRead: async () => {
    console.log('[NotificationStore] Action: markAllAsRead called.');
    const previousNotifications = get().notifications;
    const unreadIds = previousNotifications
      .filter(n => n.status !== NotificationStatus.READ)
      .map(n => n.id);

    if (unreadIds.length === 0) {
      console.log('[NotificationStore] Skipped markAllAsRead: No unread notifications.');
      return;
    }
    console.log(`[NotificationStore] Found ${unreadIds.length} unread notifications to mark.`);

    // Optimistic Update
    set(state => {
      const updatedNotifications = state.notifications.map(n => ({ ...n, status: NotificationStatus.READ }));
      console.log('[NotificationStore] Optimistic update: Marked all as read.');
      return { notifications: updatedNotifications };
    });
    get().setFilter(get().activeFilter);

    try {
      await notificationClient.mutate({
        mutation: MARK_NOTIFICATIONS_AS_READ,
        variables: { input: { notificationIds: unreadIds } },
      });
      console.log(`[NotificationStore] API Success: Server confirmed ${unreadIds.length} notifications as read.`);
    } catch (e) {
      console.error(`[NotificationStore] API Failure: markAllAsRead failed. Rolling back.`, e);
      // Rollback
      set({ notifications: previousNotifications });
      get().setFilter(get().activeFilter);
      console.log('[NotificationStore] Rollback complete.');
    }
  },

  deleteNotification: async (notificationId) => {
    console.log(`[NotificationStore] Action: deleteNotification called for ID: ${notificationId}`);
    const previousNotifications = get().notifications;

    // Optimistic Update
    set(state => {
      const updatedNotifications = state.notifications.filter(n => n.id !== notificationId);
      console.log('[NotificationStore] Optimistic update: Deleted one notification.');
      return { notifications: updatedNotifications };
    });
    get().setFilter(get().activeFilter);

    try {
      await notificationClient.mutate({
        mutation: DELETE_NOTIFICATION,
        variables: { id: notificationId },
      });
      console.log(`[NotificationStore] API Success: Server confirmed deletion of notification ${notificationId}.`);
    } catch (e) {
      console.error(`[NotificationStore] API Failure: deleteNotification for ${notificationId} failed. Rolling back.`, e);
      // Rollback
      set({ notifications: previousNotifications });
      get().setFilter(get().activeFilter);
      console.log('[NotificationStore] Rollback complete.');
    }
  },
}));