/**
 * Supabase Real-Time Cloud Synchronization Engine for PSIS Daily Teacher Administration
 * Enables instantaneous, bi-directional live sync across multiple computers, phones, and tabs.
 */

const PSIS_SupabaseSync = (() => {
  let supabaseClient = null;
  let isSyncing = false;
  let isApplyingCloudData = false;
  let autoSaveTimer = null;
  let backgroundInterval = null;
  let realtimeChannel = null;

  // Unique identifier for this client session to filter out self-broadcasted echo events
  const clientId = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

  // Map of last known Supabase cloud updated_at per branch
  const lastSyncedCloudUpdatedAt = {};

  function getConfig() {
    return window.SUPABASE_CONFIG || {
      url: 'https://dtfoaumajfkxavqbmnix.supabase.co',
      anonKey: 'sb_publishable_vCiBb00kB9va4_7lj9of9A_U8025HO1',
      tableName: 'exam_candidates',
      storageKeyPrefix: 'psis_branch_admin_'
    };
  }

  function getStorageKey(branchId) {
    const cfg = getConfig();
    const bId = branchId || (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
    return (cfg.storageKeyPrefix || 'psis_branch_admin_') + bId;
  }

  function isSyncingFromCloud() {
    return isApplyingCloudData;
  }

  function init() {
    try {
      const cfg = getConfig();
      if (!cfg.url || !cfg.anonKey || typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
        updateStatusUI('offline', 'Local Only');
        return;
      }

      supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
      updateStatusUI('connected', 'Cloud បានភ្ជាប់');

      // Immediate initial sync for current branch
      const activeBranchId = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
      syncBranchFromCloud(activeBranchId, true);

      // Start Realtime WebSockets & Background Polling
      startRealtime();
      startBackgroundPolling();

      // Immediately sync when user returns to or focuses this browser tab
      window.addEventListener('focus', () => {
        const bId = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
        syncBranchFromCloud(bId, true);
      });

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          const bId = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
          syncBranchFromCloud(bId, true);
        }
      });

    } catch (err) {
      console.warn('Supabase init error:', err);
      updateStatusUI('error', 'Cloud មិនដំណើរការ');
    }
  }

  function updateStatusUI(status, text) {
    const pill = document.getElementById('cloud-sync-pill');
    const label = document.getElementById('cloud-sync-text');
    if (!pill || !label) return;

    pill.className = 'cloud-sync-badge sync-' + status;
    label.textContent = text || 'Cloud Sync';
  }

  /**
   * Pull branch data from Supabase Cloud
   * @param {string} branchId - The branch ID to sync
   * @param {boolean} force - Whether to force re-render even if updated_at matches
   */
  async function syncBranchFromCloud(branchId, force = false) {
    if (!supabaseClient || isSyncing) return;
    const bId = branchId || (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
    const key = getStorageKey(bId);

    try {
      isSyncing = true;
      updateStatusUI('syncing', 'កំពុង Sync...');

      const cfg = getConfig();
      const { data, error } = await supabaseClient
        .from(cfg.tableName)
        .select('exam_key, data, updated_at')
        .eq('exam_key', key)
        .maybeSingle();

      if (error) throw error;

      if (data && data.data && typeof data.data === 'object') {
        const cloudData = data.data;
        const cloudUpdatedAt = data.updated_at || (cloudData && cloudData.savedAt) || '';
        const isNewCloudData = cloudUpdatedAt !== lastSyncedCloudUpdatedAt[bId];

        if (isNewCloudData || force) {
          lastSyncedCloudUpdatedAt[bId] = cloudUpdatedAt;

          // Mark applying cloud data so storage operations don't trigger recursive saves back to Cloud
          isApplyingCloudData = true;
          try {
            if (Array.isArray(cloudData.teachers)) {
              PSIS_Storage.saveTeachers(cloudData.teachers, bId);
            }
            if (Array.isArray(cloudData.schedules)) {
              PSIS_Storage.saveSchedules(cloudData.schedules, bId);
            }
            if (cloudData.schoolInfo && typeof cloudData.schoolInfo === 'object') {
              PSIS_Storage.saveSchoolInfo(cloudData.schoolInfo, bId);
            }
            if (cloudData.checklists && typeof cloudData.checklists === 'object') {
              PSIS_Storage.saveAllChecklists(cloudData.checklists, bId);
            }
          } finally {
            isApplyingCloudData = false;
          }

          // If this branch is currently displayed on screen, refresh the UI immediately
          const currentActiveBranch = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null);
          if (currentActiveBranch === bId) {
            if (typeof PSIS_App !== 'undefined' && typeof PSIS_App.refreshAllData === 'function') {
              PSIS_App.refreshAllData();
            }
          }
        }
        updateStatusUI('connected', 'Cloud បានភ្ជាប់');
      } else {
        // Cloud has no data row for this branch yet -> push local data to Cloud
        console.log('[Supabase] Initializing Cloud for ' + bId + ' with local data...');
        await saveBranchToCloud(bId, true);
      }
    } catch (err) {
      console.warn('[Supabase Sync Error]', err);
      updateStatusUI('connected', 'Cloud បានភ្ជាប់');
    } finally {
      isSyncing = false;
    }
  }

  /**
   * Push branch data to Supabase Cloud
   * @param {string} branchId - The branch ID
   * @param {boolean} immediate - If true, saves immediately without debouncing
   */
  async function saveBranchToCloud(branchId, immediate = false) {
    if (!supabaseClient || isApplyingCloudData) return;

    if (!immediate) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        saveBranchToCloud(branchId, true);
      }, 350);
      return;
    }

    const bId = branchId || (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
    const key = getStorageKey(bId);

    try {
      updateStatusUI('syncing', 'កំពុងរក្សាទុក...');
      const cfg = getConfig();
      const nowIso = new Date().toISOString();

      const payload = {
        teachers: PSIS_Storage.getTeachers(bId),
        schedules: PSIS_Storage.getSchedules(bId),
        schoolInfo: PSIS_Storage.getSchoolInfo(bId),
        checklists: PSIS_Storage.getAllChecklists(bId),
        savedAt: nowIso,
        savedBy: clientId
      };

      const { error } = await supabaseClient
        .from(cfg.tableName)
        .upsert({
          exam_key: key,
          data: payload,
          updated_at: nowIso
        }, { onConflict: 'exam_key' });

      if (error) throw error;

      lastSyncedCloudUpdatedAt[bId] = nowIso;
      updateStatusUI('connected', 'Cloud រួចរាល់');

      // Instant WebSocket Broadcast to all other devices (< 50ms)
      if (realtimeChannel) {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'branch_updated',
          payload: {
            branchId: bId,
            senderId: clientId,
            updatedAt: nowIso
          }
        });
      }

      setTimeout(() => {
        updateStatusUI('connected', 'Cloud បានភ្ជាប់');
      }, 1200);

    } catch (err) {
      console.warn('[Supabase Save Error]', err);
      updateStatusUI('error', 'Sync មិនជោគជ័យ');
    }
  }

  /**
   * Subscribe to Supabase Realtime channels
   */
  function startRealtime() {
    if (!supabaseClient) return;
    try {
      const cfg = getConfig();

      // Realtime Broadcast Channel: Instant peer-to-peer updates without relying on postgres replication
      realtimeChannel = supabaseClient.channel('psis_branch_realtime_v2', {
        config: {
          broadcast: { ack: false, self: false }
        }
      });

      realtimeChannel
        .on('broadcast', { event: 'branch_updated' }, (msg) => {
          if (!msg || !msg.payload) return;
          const { branchId, senderId } = msg.payload;
          // Ignore broadcast from self
          if (senderId === clientId) return;

          const currentBranch = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
          if (!branchId || branchId === currentBranch) {
            console.log('[Supabase Broadcast] Instant update notification for', branchId, 'from', senderId);
            syncBranchFromCloud(branchId || currentBranch, true);
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: cfg.tableName
        }, (payload) => {
          const activeBranchId = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
          const expectedKey = getStorageKey(activeBranchId);
          if (payload.new && payload.new.exam_key === expectedKey) {
            console.log('[Supabase Postgres Changes] Change event for', activeBranchId);
            syncBranchFromCloud(activeBranchId, true);
          }
        })
        .subscribe((status) => {
          console.log('[Supabase Realtime Channel Status]', status);
        });

    } catch (e) {
      console.warn('Realtime subscribe warning:', e);
    }
  }

  /**
   * Periodic background polling (fallback when WebSocket drops or mobile tab wakes)
   */
  function startBackgroundPolling() {
    if (backgroundInterval) clearInterval(backgroundInterval);
    // Poll every 2.5 seconds when tab is active
    backgroundInterval = setInterval(() => {
      if (document.hidden || isSyncing) return;
      const activeBranchId = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
      syncBranchFromCloud(activeBranchId, false);
    }, 2500);
  }

  return {
    init,
    syncBranchFromCloud,
    saveBranchToCloud,
    isSyncingFromCloud,
    updateStatusUI
  };
})();

// Auto-initialize when DOM and Supabase library are ready
document.addEventListener('DOMContentLoaded', () => {
  let attempts = 0;
  function checkReady() {
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
      PSIS_SupabaseSync.init();
    } else if (attempts < 20) {
      attempts++;
      setTimeout(checkReady, 100);
    }
  }
  checkReady();
});
