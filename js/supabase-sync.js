/**
 * Supabase Real-Time Cloud Synchronization Engine for PSIS Daily Teacher Administration
 * Automatically synchronizes teachers, schedules, and daily checklists across multiple computers and phones.
 */

const PSIS_SupabaseSync = (() => {
  let supabaseClient = null;
  let isSyncing = false;
  let lastCloudUpdatedAt = null;
  let autoSaveTimer = null;
  let backgroundInterval = null;
  let realtimeChannel = null;

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

  function init() {
    try {
      const cfg = getConfig();
      if (!cfg.url || !cfg.anonKey || typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
        updateStatusUI('offline', 'Local Only');
        return;
      }

      supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
      updateStatusUI('connected', 'Cloud បានភ្ជាប់');

      // Hook initial sync for active branch
      const activeBranchId = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
      syncBranchFromCloud(activeBranchId, true);

      // Start Realtime & Periodic Background Sync
      startRealtime();
      startBackgroundPolling();

      // Sync on window focus (when user switches back to this browser tab)
      window.addEventListener('focus', () => {
        const bId = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
        syncBranchFromCloud(bId, false);
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
   */
  async function syncBranchFromCloud(branchId, isFirstLoad = false) {
    if (!supabaseClient || isSyncing) return;
    const key = getStorageKey(branchId);

    try {
      isSyncing = true;
      if (!isFirstLoad) updateStatusUI('syncing', 'កំពុង Sync...');

      const cfg = getConfig();
      const { data, error } = await supabaseClient
        .from(cfg.tableName)
        .select('exam_key, data, updated_at')
        .eq('exam_key', key)
        .maybeSingle();

      if (error) throw error;

      if (data && data.data && typeof data.data === 'object') {
        const cloudData = data.data;
        const cloudTime = new Date(data.updated_at || 0).getTime();
        const localSavedTime = parseInt(localStorage.getItem(`psis_${branchId}_local_time`) || '0', 10);
        const localTeachers = PSIS_Storage.getTeachers(branchId);

        // If local has 9+ teachers (like Computer 1) and cloud has fewer, push local to cloud!
        if (isFirstLoad && localTeachers.length > (cloudData.teachers ? cloudData.teachers.length : 0)) {
          console.log('[Supabase] Local has more teachers than cloud. Pushing local data to Cloud...');
          await saveBranchToCloud(branchId, true);
          return;
        }

        // Apply cloud updates if cloud is newer or local is initial sample data
        if (cloudTime > localSavedTime || isFirstLoad) {
          lastCloudUpdatedAt = data.updated_at;
          localStorage.setItem(`psis_${branchId}_local_time`, String(cloudTime));

          if (Array.isArray(cloudData.teachers)) {
            PSIS_Storage.saveTeachers(cloudData.teachers, branchId);
          }
          if (Array.isArray(cloudData.schedules)) {
            PSIS_Storage.saveSchedules(cloudData.schedules, branchId);
          }
          if (cloudData.schoolInfo && typeof cloudData.schoolInfo === 'object') {
            PSIS_Storage.saveSchoolInfo(cloudData.schoolInfo, branchId);
          }
          if (cloudData.checklists && typeof cloudData.checklists === 'object') {
            PSIS_Storage.saveAllChecklists(cloudData.checklists, branchId);
          }

          // Refresh UI if app is loaded
          if (typeof PSIS_App !== 'undefined' && typeof PSIS_App.refreshAllData === 'function') {
            PSIS_App.refreshAllData();
          }
        }
        updateStatusUI('connected', 'Cloud បានភ្ជាប់');
      } else {
        // Cloud has no data for this branch yet -> push local data to Cloud
        console.log('[Supabase] No cloud data found for ' + branchId + '. Initializing Cloud with local data...');
        await saveBranchToCloud(branchId, true);
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
   */
  async function saveBranchToCloud(branchId, immediate = false) {
    if (!supabaseClient) return;

    if (!immediate) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        saveBranchToCloud(branchId, true);
      }, 600);
      return;
    }

    const bId = branchId || (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
    const key = getStorageKey(bId);

    try {
      updateStatusUI('syncing', 'កំពុងរក្សាទុក...');
      const cfg = getConfig();
      const payload = {
        teachers: PSIS_Storage.getTeachers(bId),
        schedules: PSIS_Storage.getSchedules(bId),
        schoolInfo: PSIS_Storage.getSchoolInfo(bId),
        checklists: PSIS_Storage.getAllChecklists(bId)
      };

      const nowIso = new Date().toISOString();
      const { error } = await supabaseClient
        .from(cfg.tableName)
        .upsert({
          exam_key: key,
          data: payload,
          updated_at: nowIso
        }, { onConflict: 'exam_key' });

      if (error) throw error;

      lastCloudUpdatedAt = nowIso;
      localStorage.setItem(`psis_${bId}_local_time`, String(Date.now()));
      updateStatusUI('connected', 'Cloud រួចរាល់');

      setTimeout(() => {
        updateStatusUI('connected', 'Cloud បានភ្ជាប់');
      }, 1500);

    } catch (err) {
      console.warn('[Supabase Save Error]', err);
      updateStatusUI('error', 'Sync មិនជោគជ័យ');
    }
  }

  function startRealtime() {
    if (!supabaseClient) return;
    try {
      const cfg = getConfig();
      realtimeChannel = supabaseClient
        .channel('psis_teacher_admin_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: cfg.tableName
        }, (payload) => {
          const activeBranchId = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
          const expectedKey = getStorageKey(activeBranchId);
          if (payload.new && payload.new.exam_key === expectedKey) {
            console.log('[Supabase Realtime] Change received from another computer!');
            syncBranchFromCloud(activeBranchId, false);
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscribe warning:', e);
    }
  }

  function startBackgroundPolling() {
    if (backgroundInterval) clearInterval(backgroundInterval);
    // Poll every 7 seconds
    backgroundInterval = setInterval(() => {
      if (document.hidden || isSyncing) return;
      const activeBranchId = (typeof PSIS_Storage !== 'undefined' ? PSIS_Storage.getCurrentBranchId() : null) || 'psis-ii';
      syncBranchFromCloud(activeBranchId, false);
    }, 7000);
  }

  return {
    init,
    syncBranchFromCloud,
    saveBranchToCloud,
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
