/**
 * Local persistence for cloud synchronization metadata.
 */
import { CLOUD_CONFIG } from "./cloudConfig.js";

export var CLOUD_STATUS = {
  DISCONNECTED: "disconnected",
  IDLE: "idle",
  SYNCING: "syncing",
  SUCCESS: "success",
  ERROR: "error",
  NEEDS_RECONNECT: "needs-reconnect",
  DECISION_PENDING: "decision-pending"
};

export function createDefaultSyncState() {
  return {
    connected: false,
    userEmail: null,
    status: CLOUD_STATUS.DISCONNECTED,
    lastSuccessfulBackupTime: null,
    lastAttemptTime: null,
    lastError: null,
    notifyFailures: true,
    lastSyncedChecksum: null,
    encryptionEnabled: false,
    hasRollbackSnapshot: false,
    decision: null
  };
}

export class CloudSyncStateStorage {
  constructor(storageKey = CLOUD_CONFIG.stateStorageKey) {
    this.storageKey = storageKey;
  }

  load() {
    try {
      var raw = localStorage.getItem(this.storageKey);
      if (!raw) return createDefaultSyncState();
      var parsed = JSON.parse(raw);
      return { ...createDefaultSyncState(), ...parsed };
    } catch {
      return createDefaultSyncState();
    }
  }

  save(state) {
    try {
      var toSave = {
        connected: state.connected,
        userEmail: state.userEmail,
        status: state.status,
        lastSuccessfulBackupTime: state.lastSuccessfulBackupTime,
        lastAttemptTime: state.lastAttemptTime,
        lastError: state.lastError,
        notifyFailures: state.notifyFailures,
        lastSyncedChecksum: state.lastSyncedChecksum,
        encryptionEnabled: state.encryptionEnabled,
        hasRollbackSnapshot: state.hasRollbackSnapshot,
        decision: state.decision ? { ...state.decision, dismissed: Boolean(state.decision.dismissed) } : null
      };
      localStorage.setItem(this.storageKey, JSON.stringify(toSave));
    } catch (err) {
      console.warn("Failed to save cloud sync state", err);
    }
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}

export var cloudSyncStateStorage = new CloudSyncStateStorage();
