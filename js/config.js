/**
 * js/config.js
 * No build step in this project (plain ES modules loaded directly by the
 * browser) so there is no `import.meta.env` — configuration is just a
 * plain exported object. Both values are public anyway (VAPID public key
 * and worker URL), never put VAPID_PRIVATE_KEY anywhere in this repo.
 */
export const PUSH_CONFIG = {
  vapidPublicKey: "BA18rkqe2tyTIL7tk7X-MjQ091fRxChBkeXUdzPSoFxEAbG1wTWosJNQ-IENoypAkhnrchn-KO_bteWOFPunZbE",
  apiBaseUrl: "https://task-reminders.mhkarami97.workers.dev",
};