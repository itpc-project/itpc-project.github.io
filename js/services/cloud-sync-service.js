/**
 * CLOUD REALTIME JSON SYNC SERVICE
 * จัดการฐานข้อมูลออนไลน์ JSON และการซิงค์ข้อมูลแบบเรียลไทม์ข้ามเครื่อง (Multi-device Realtime Sync)
 * ทำงานบน Static Hosting (GitHub Pages) โดยไม่ต้องย้ายระบบหรือตั้งค่า Backend Server ใหม่
 */

import { APP_CONFIG, DEMO_ACCOUNTS } from '../config.js';
import { showToast } from '../utils/toast.js';

const STORAGE_KEYS = {
  PROJECTS: 'satit_cmu_projects_data',
  ACTIVITIES: 'satit_cmu_activities_data',
  FORMS: 'satit_cmu_activity_forms',
  USERS: 'satit_cmu_users_data',
  CONFIG: 'satit_cmu_cloud_config',
  LOCAL_TIMESTAMP: 'satit_cmu_last_local_update'
};

// Default high-speed online JSON master object (pre-provisioned)
const DEFAULT_OBJECT_ID = 'ff808181a09d98f701a11fd53bb62a0e';
const DEFAULT_REST_URL = `https://api.restful-api.dev/objects/${DEFAULT_OBJECT_ID}`;

class CloudSyncManager {
  constructor() {
    this.config = this.loadConfig();
    this.broadcastChannel = null;
    this.pushTimeout = null;
    this.syncIntervalId = null;
    this.isSyncing = false;
    this.subscribers = new Set();
    this.hasInitialized = false;

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('satit_cmu_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'LOCAL_DATA_CHANGED') {
            this.notifySubscribers(event.data.payload, 'tab');
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }
  }

  loadConfig() {
    const defaultFirebase = APP_CONFIG.FIREBASE_DATABASE_URL || 'https://satit-cmu-db-default-rtdb.asia-southeast1.firebasedatabase.app';
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored);
        const resolvedFirebase = (parsed.firebaseUrl && parsed.firebaseUrl.trim()) ? parsed.firebaseUrl.trim() : defaultFirebase;
        return {
          enabled: true,
          endpoint: DEFAULT_REST_URL,
          autoSync: true,
          syncIntervalMs: 12000,
          ...parsed,
          firebaseUrl: resolvedFirebase
        };
      }
    } catch {}
    return {
      enabled: true,
      endpoint: DEFAULT_REST_URL,
      firebaseUrl: defaultFirebase,
      autoSync: true,
      syncIntervalMs: 12000
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
    } catch {}
    this.updateStatusBadge();
  }

  /**
   * คำนวณ URL ปลายทางสำหรับการดึง/บันทึก JSON
   */
  getTargetUrl() {
    const defaultFirebase = 'https://satit-cmu-db-default-rtdb.asia-southeast1.firebasedatabase.app';
    const fbUrl = (this.config.firebaseUrl && this.config.firebaseUrl.trim()) || defaultFirebase;
    let clean = fbUrl.trim().replace(/\/+$/, '');
    if (!clean.endsWith('.json')) clean += '/satit_cmu.json';
    return { url: clean, provider: 'firebase' };
  }

  /**
   * รวบรวมข้อมูลทั้งหมดในระบบให้เป็นก้อน JSON สมบูรณ์
   */
  exportAllDataAsJSON() {
    let projects = [];
    let activities = [];
    let forms = {};
    let users = [];

    try {
      projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
    } catch {}
    try {
      activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
    } catch {}
    try {
      forms = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS) || '{}');
    } catch {}
    try {
      users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } catch {}

    const currentUser = this.getCurrentUserName();

    return {
      version: '1.0.0',
      system: 'satit_cmu_pre_generator',
      organization: APP_CONFIG.ORGANIZATION,
      updatedAt: Date.now(),
      updatedAtISO: new Date().toISOString(),
      updatedBy: currentUser,
      projects,
      activities,
      activityForms: forms,
      users
    };
  }

  getCurrentUserName() {
    try {
      const auth = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER);
      if (auth) {
        const u = JSON.parse(auth);
        return u.name || u.email || 'ผู้ใช้งานระบบ';
      }
    } catch {}
    return 'ผู้ใช้งานระบบ';
  }

  /**
   * เริ่มต้นการทำงานของ Cloud Sync
   */
  init() {
    if (this.hasInitialized) return;
    this.hasInitialized = true;

    // 1. ดึงข้อมูลจาก Cloud ทันทีตอนโหลดหน้า
    if (this.config.enabled) {
      setTimeout(() => {
        this.pull(false);
      }, 300);
    }

    // 2. ซิงค์เมื่อสลับกลับมาที่แท็บเบราว์เซอร์
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        if (this.config.enabled && this.config.autoSync) {
          this.pull(false);
        }
      });

      // ซิงค์เมื่อต่อเน็ตใหม่
      window.addEventListener('online', () => {
        this.updateStatusBadge('online');
        this.pull(false);
      });

      window.addEventListener('offline', () => {
        this.updateStatusBadge('offline');
      });
    }

    // 3. Heartbeat ตรวจสอบข้อมูลจาก Cloud เป็นระยะ (ทุก 10 วินาที)
    if (this.syncIntervalId) clearInterval(this.syncIntervalId);
    this.syncIntervalId = setInterval(() => {
      if (this.config.enabled && this.config.autoSync && !document.hidden) {
        this.pull(false);
      }
    }, this.config.syncIntervalMs || 10000);

    this.updateStatusBadge();
  }

  /**
   * ดึงข้อมูลล่าสุดจาก Cloud JSON (Pull)
   * @param {boolean} force - บังคับเขียนทับข้อมูลในเครื่อง
   */
  async pull(force = false) {
    if (this.isSyncing || !this.config.enabled) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateStatusBadge('offline');
      return;
    }

    this.isSyncing = true;
    this.updateStatusBadge('syncing');

    try {
      const { url, provider } = this.getTargetUrl();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const raw = await response.json();
      const remoteData = provider === 'rest' ? (raw.data || raw) : raw;

      // ดึงข้อมูลในเครื่องเพื่อตรวจสอบการผสาน
      let localProjects = [];
      let localActivities = [];
      let localForms = {};
      try {
        localProjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
      } catch {}
      try {
        localActivities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
      } catch {}
      try {
        localForms = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS) || '{}');
      } catch {}

      if (!remoteData || typeof remoteData !== 'object' || !Array.isArray(remoteData.projects) || remoteData.projects.length === 0) {
        if (localProjects.length > 0 || localActivities.length > 0) {
          console.log('[CloudSync] Remote DB is empty. Initializing with local data...');
          await this.push();
        }
        this.updateStatusBadge('synced');
        return { success: true, data: remoteData };
      }

      const remoteActivities = Array.isArray(remoteData.activities) ? remoteData.activities : [];
      const remoteForms = (remoteData.activityForms && typeof remoteData.activityForms === 'object') ? remoteData.activityForms : {};

      // ตรวจสอบว่าในเครื่องมีกิจกรรมที่สร้างไว้ แต่บนคลาวด์ยังไม่มีหรือไม่ -> ถ้ามีให้ผสานและส่งขึ้นคลาวด์ทันที
      let needsPushBack = false;
      let mergedActivities = [...remoteActivities];
      if (localActivities.length > 0) {
        localActivities.forEach((localAct) => {
          if (!mergedActivities.some((r) => r.id === localAct.id)) {
            mergedActivities.push(localAct);
            needsPushBack = true;
          }
        });
      }

      const mergedForms = { ...localForms, ...remoteForms };
      if (Object.keys(localForms).length > Object.keys(remoteForms).length) {
        needsPushBack = true;
      }

      if (needsPushBack) {
        console.log('[CloudSync] Found local activities/forms not in cloud. Merging and pushing to Firebase...');
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mergedActivities));
        localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(mergedForms));
        await this.push();
        this.updateStatusBadge('synced');
        this.notifySubscribers(this.exportAllDataAsJSON(), 'merge');
        return { success: true, data: this.exportAllDataAsJSON() };
      }

      const remoteTimestamp = Number(remoteData.updatedAt) || 0;
      const localTimestamp = Number(localStorage.getItem(STORAGE_KEYS.LOCAL_TIMESTAMP)) || 0;

      // ตรวจสอบว่าข้อมูลบน Cloud ใหม่กว่าข้อมูลในเครื่อง หรือมีกิจกรรมใหม่ หรือถูกบังคับอัปเดต
      if (force || remoteTimestamp > localTimestamp || remoteActivities.length !== localActivities.length) {
        let hasUpdated = false;

        if (Array.isArray(remoteData.projects) && remoteData.projects.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(remoteData.projects));
          hasUpdated = true;
        }

        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mergedActivities));
        hasUpdated = true;

        localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(mergedForms));
        hasUpdated = true;

        if (Array.isArray(remoteData.users) && remoteData.users.length > 0) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(remoteData.users));
          hasUpdated = true;
          try {
            const rawSession = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER);
            if (rawSession) {
              const currentAuth = JSON.parse(rawSession);
              const matched = remoteData.users.find(u => u.id === currentAuth.id || (u.email && u.email.toLowerCase() === currentAuth.email?.toLowerCase()));
              if (matched) {
                sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(matched));
              }
            }
          } catch {}
        }

        if (hasUpdated) {
          localStorage.setItem(STORAGE_KEYS.LOCAL_TIMESTAMP, String(remoteTimestamp || Date.now()));
          this.notifySubscribers(remoteData, 'cloud');
        }
      }

      this.updateStatusBadge('synced');
      return { success: true, data: remoteData };
    } catch (err) {
      console.warn('[CloudSync] Pull failed (using local data):', err.message);
      this.updateStatusBadge('error');
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * ส่งข้อมูลขึ้น Cloud JSON (Push)
   */
  async push() {
    if (!this.config.enabled) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateStatusBadge('offline');
      return;
    }

    const payload = this.exportAllDataAsJSON();
    const now = Date.now();
    payload.updatedAt = now;
    localStorage.setItem(STORAGE_KEYS.LOCAL_TIMESTAMP, String(now));

    this.updateStatusBadge('syncing');

    try {
      const { url, provider } = this.getTargetUrl();
      const body = provider === 'rest'
        ? JSON.stringify({ name: 'satit_cmu_master_data_v1', data: payload })
        : JSON.stringify(payload);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      this.updateStatusBadge('synced');

      // แจ้งแท็บอื่นในเครื่องเดียวกัน
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'LOCAL_DATA_CHANGED',
          payload
        });
      }

      return { success: true, payload };
    } catch (err) {
      console.warn('[CloudSync] Push failed:', err.message);
      this.updateStatusBadge('error');
      return { success: false, error: err.message };
    }
  }

  /**
   * หน่วงเวลาส่งข้อมูลขึ้นคลาวด์เพื่อไม่ให้เกิด Request ซ้ำซ้อน (Debounce 500ms)
   */
  schedulePush() {
    if (this.pushTimeout) clearTimeout(this.pushTimeout);
    this.pushTimeout = setTimeout(() => {
      this.push();
    }, 500);
  }

  /**
   * ดาวน์โหลดไฟล์สำรองข้อมูล JSON ลงเครื่องคอมพิวเตอร์
   */
  downloadJSONBackup() {
    const data = this.exportAllDataAsJSON();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const link = document.createElement('a');
    link.href = url;
    link.download = `satit_cmu_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'ดาวน์โหลดไฟล์ JSON สำเร็จ',
      message: `บันทึกไฟล์ satit_cmu_backup_${dateStr}.json เรียบร้อยแล้ว`
    });
  }

  /**
   * นำเข้าไฟล์ข้อมูล JSON เข้าสู่ระบบ
   */
  async importJSONData(jsonInput) {
    try {
      let data = jsonInput;
      if (typeof jsonInput === 'string') {
        data = JSON.parse(jsonInput);
      }

      if (!data || typeof data !== 'object') {
        throw new Error('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
      }

      let restoredCount = 0;
      if (Array.isArray(data.projects)) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
        restoredCount += data.projects.length;
      }
      if (Array.isArray(data.activities)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(data.activities));
        restoredCount += data.activities.length;
      }
      if (data.activityForms && typeof data.activityForms === 'object') {
        localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(data.activityForms));
      }
      if (Array.isArray(data.users)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      }

      const now = Date.now();
      localStorage.setItem(STORAGE_KEYS.LOCAL_TIMESTAMP, String(now));

      // Push ขึ้น Cloud JSON ทันที
      await this.push();

      showToast({
        type: 'success',
        title: 'นำเข้าข้อมูล JSON สำเร็จ!',
        message: `อัปเดตข้อมูลและส่งข้อมูลไปยังคลาวด์เรียบร้อยแล้ว (${restoredCount} รายการ)`
      });

      this.notifySubscribers(data, 'import');
      return { success: true };
    } catch (err) {
      showToast({
        type: 'error',
        title: 'นำเข้าข้อมูลล้มเหลว',
        message: err.message || 'กรุณาตรวจสอบโครงสร้างไฟล์ JSON'
      });
      return { success: false, error: err.message };
    }
  }

  /**
   * แจ้งเตือน Component หรือหน้าที่เปิดอยู่เมื่อข้อมูลอัปเดต
   */
  notifySubscribers(payload, source) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('satit-cmu-cloud-synced', {
          detail: { data: payload, source }
        })
      );
    }
    this.subscribers.forEach((callback) => {
      try {
        callback(payload, source);
      } catch (e) {
        console.error('Subscriber callback error:', e);
      }
    });
  }

  onSync(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * อัปเดตการแสดงผลป้ายสถานะ Cloud Sync บน UI
   */
  updateStatusBadge(statusOverride) {
    if (typeof document === 'undefined') return;

    const badges = document.querySelectorAll('.cloud-sync-status-indicator, #navbarSyncBadge, #navbarCloudSyncBtn');
    badges.forEach((badge) => {
      const dot = badge.querySelector('.sync-dot') || badge;
      const text = badge.querySelector('.sync-text');

      const hasDb = Boolean(this.config.firebaseUrl && this.config.firebaseUrl.trim());

      let status = statusOverride;
      if (!status) {
        if (!navigator.onLine) status = 'offline';
        else if (this.isSyncing) status = 'syncing';
        else if (!hasDb) status = 'local';
        else status = 'synced';
      }

      if (status === 'synced') {
        dot.style.backgroundColor = '#10b981';
        if (text) text.textContent = 'Firebase ออนไลน์';
        badge.setAttribute('title', '🟢 เชื่อมต่อฐานข้อมูลออนไลน์ Firebase เรียบร้อย (ข้อมูลซิงค์กันทุกเครื่อง)');
      } else if (status === 'local') {
        dot.style.backgroundColor = '#f59e0b';
        if (text) text.textContent = 'บันทึกในเครื่อง (Local)';
        badge.setAttribute('title', '🟡 บันทึกในเครื่องนี้เท่านั้น (คลิกเพื่อเชื่อมต่อ Firebase ออนไลน์ให้เห็นทุกเครื่อง)');
      } else if (status === 'syncing') {
        dot.style.backgroundColor = '#3b82f6';
        if (text) text.textContent = 'กำลังซิงค์...';
        badge.setAttribute('title', '⚡ กำลังส่ง/ดึงข้อมูลกับฐานข้อมูลออนไลน์');
      } else if (status === 'offline') {
        dot.style.backgroundColor = '#94a3b8';
        if (text) text.textContent = 'ออฟไลน์';
        badge.setAttribute('title', '⚪ ทำงานในโหมดออฟไลน์');
      } else if (status === 'error') {
        dot.style.backgroundColor = '#ef4444';
        if (text) text.textContent = 'คลาวด์ขัดข้อง (ใช้ข้อมูลเครื่อง)';
        badge.setAttribute('title', '🔴 เกิดข้อผิดพลาดในการเชื่อมต่อคลาวด์');
      }
    });
  }
}

export const CloudSyncService = new CloudSyncManager();
