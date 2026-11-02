/**
 * Configuration constants for Google Drive appDataFolder backup.
 */
var fallbackClientId = "627723972815-qrp35936cvbodbo2udkp4qeeh6sgoqms.apps.googleusercontent.com";

export var CLOUD_CONFIG = {
  clientId: fallbackClientId,
  scope: "https://www.googleapis.com/auth/drive.appdata",
  appFolder: "appDataFolder",
  appName: "persian-task-app",
  fileNamePrefix: "persian-task.backup.",
  keepVersions: 3,
  autoBackupDebounceMs: 15000,
  pbkdf2Iterations: 600000,
  minPassphraseLength: 8,
  dbName: "PersianTaskCloudDB",
  stateStorageKey: "persian-task-app:cloudSync:state"
};
