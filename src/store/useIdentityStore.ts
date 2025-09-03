import { tenantClient } from '@/api/apoloClient';
import { CREATE_OR_UPDATE_IDENTITY } from '@/api/mutations/identityMutations';
import { GET_IDENTITY_BY_USER_ID } from '@/api/queries/identityQueries';
import { Identity } from '@/types/dtos/identity/patient-identity.dto';
import { create } from 'zustand';

// Định nghĩa kiểu dữ liệu cho Input DTO, khớp với backend
type CreateOrUpdateIdentityInput = Omit<Identity, 'id' | 'userId'>;

interface IdentityState {
  identity: Identity | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchIdentity: () => Promise<void>;
  updateIdentity: (input: CreateOrUpdateIdentityInput) => Promise<boolean>;
  clearIdentity: () => void;
}

export const useIdentityStore = create<IdentityState>((set, get) => ({
  identity: null,
  isLoading: false,
  error: null,

  /**
   * Lấy thông tin danh tính của người dùng hiện tại từ server.
   */
  fetchIdentity: async () => {
    if (get().isLoading || get().identity) return;

    console.log('[IdentityStore] Action: fetchIdentity called.');
    set({ isLoading: true, error: null });

    try {
      const { data } = await tenantClient.query({
        query: GET_IDENTITY_BY_USER_ID,
        fetchPolicy: 'network-only',
      });

      const fetchedIdentity: Identity | null = data.identityByUserId;
      
      if (fetchedIdentity) {
        console.log(`[IdentityStore] API Success: Fetched identity for user with phone number ${fetchedIdentity.phoneNumber}`);
        set({ identity: fetchedIdentity, isLoading: false });
      } else {
        console.log('[IdentityStore] API Success: No identity found for current user.');
        set({ identity: null, isLoading: false });
      }
    } catch (e: any) {
      console.error('[IdentityStore] API Failure: fetchIdentity failed.', e);
      set({ error: e.message, isLoading: false });
    }
  },

  /**
   * Tạo mới hoặc cập nhật thông tin danh tính của người dùng.
   * @param input Dữ liệu danh tính mới.
   * @returns `true` nếu thành công, `false` nếu thất bại.
   */
  updateIdentity: async (input: CreateOrUpdateIdentityInput): Promise<boolean> => {
    console.log('[IdentityStore] Action: updateIdentity called.');
    
    const previousIdentity = get().identity;

    const optimisticIdentity: Identity = {
      id: previousIdentity?.id || 'temp-id', 
      ...input,
    };
    set({ identity: optimisticIdentity, error: null });
    console.log('[IdentityStore] Optimistic update performed.');

    try {
      const { data } = await tenantClient.mutate({
        mutation: CREATE_OR_UPDATE_IDENTITY,
        variables: { input },
      });

      const updatedIdentity: Identity = data.createOrUpdateIdentity;
      
      if (!updatedIdentity) {
        throw new Error("Server did not return updated identity.");
      }
      
      console.log(`[IdentityStore] API Success: Successfully updated identity ${updatedIdentity.id}`);

      set({ identity: updatedIdentity });
      return true;

    } catch (e: any) {
      console.error('[IdentityStore] API Failure: updateIdentity failed. Rolling back.', e);
      // Rollback
      set({ identity: previousIdentity, error: e.message });
      console.log('[IdentityStore] Rollback complete.');
      return false;
    }
  },

  /**
   * Xóa thông tin danh tính khỏi state (ví dụ: khi người dùng đăng xuất).
   */
  clearIdentity: () => {
    console.log('[IdentityStore] Action: clearIdentity called.');
    set({ identity: null, error: null, isLoading: false });
  },
}));