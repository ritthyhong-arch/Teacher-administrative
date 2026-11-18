/**
 * Supabase Cloud Configuration for Paññāsāstra International School (PSIS)
 * Enables live multi-user real-time synchronization directly on GitHub Pages.
 */
window.SUPABASE_CONFIG = {
  url: localStorage.getItem('supabase_project_url') || 'https://dtfoaumajfkxavqbmnix.supabase.co',
  anonKey: localStorage.getItem('supabase_anon_key') || 'sb_publishable_vCiBb00kB9va4_7lj9of9A_U8025HO1',
  tableName: 'exam_candidates',
  storageKeyPrefix: 'psis_branch_admin_'
};
