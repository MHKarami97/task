var ce=n=>{throw TypeError(n)};var de=(n,e,t)=>e.has(n)||ce("Cannot "+t);var P=(n,e,t)=>(de(n,e,"read from private field"),t?t.call(n):e.get(n)),Y=(n,e,t)=>e.has(n)?ce("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(n):e.set(n,t),K=(n,e,t,i)=>(de(n,e,"write to private field"),i?i.call(n,t):e.set(n,t),t);var ue=(n,e,t,i)=>({set _(r){K(n,e,r,t)},get _(){return P(n,e,i)}});(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();class Ne{constructor(){this._listeners=new Map}on(e,t){return this._listeners.has(e)||this._listeners.set(e,new Set),this._listeners.get(e).add(t),()=>this.off(e,t)}off(e,t){var i;(i=this._listeners.get(e))==null||i.delete(t)}emit(e,t){var i;(i=this._listeners.get(e))==null||i.forEach(r=>r(t))}}const S=new Ne,w=Object.freeze({TASKS_CHANGED:"tasks:changed",LISTS_CHANGED:"lists:changed",THEME_CHANGED:"theme:changed",VIEW_CHANGED:"view:changed",DATE_SELECTED:"date:selected"});class Oe{constructor(){this._routes=new Map,window.addEventListener("hashchange",()=>this._resolve())}register(e,t){return this._routes.set(e,t),this}start(e="tasks"){window.location.hash||(window.location.hash=`#/${e}`),this._resolve()}navigate(e){window.location.hash=`#/${e}`}_resolve(){const e=window.location.hash.replace("#/","")||"tasks",t=this._routes.get(e)||this._routes.get("tasks");t==null||t(e),S.emit(w.VIEW_CHANGED,e)}}class Re{constructor(e="persian-task-app"){this.namespace=e}_key(e){return`${this.namespace}:${e}`}get(e,t=null){try{const i=localStorage.getItem(this._key(e));return i?JSON.parse(i):t}catch(i){return console.error(`StorageAdapter.get failed for "${e}"`,i),t}}set(e,t){try{return localStorage.setItem(this._key(e),JSON.stringify(t)),!0}catch(i){return console.error(`StorageAdapter.set failed for "${e}"`,i),!1}}remove(e){localStorage.removeItem(this._key(e))}}const $=new Re;function ae(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`}class U{constructor({id:e=ae(),title:t,notes:i="",listId:r="default",dueDateISO:s=null,dueTime:a=null,priority:c="medium",completed:o=!1,completedAtISO:u=null,createdAtISO:b=new Date().toISOString(),repeat:_="none",subtasks:y=[],reminderMinutesBefore:p=null,starred:E=!1}){if(!t||!t.trim())throw new Error("Task title must not be empty");this.id=e,this.title=t.trim(),this.notes=i,this.listId=r,this.dueDateISO=s,this.dueTime=a,this.priority=c,this.completed=o,this.completedAtISO=u,this.createdAtISO=b,this.repeat=_,this.subtasks=y,this.reminderMinutesBefore=p,this.starred=E}markComplete(){this.completed=!0,this.completedAtISO=new Date().toISOString()}markIncomplete(){this.completed=!1,this.completedAtISO=null}toggle(){this.completed?this.markIncomplete():this.markComplete()}toggleStar(){this.starred=!this.starred}addSubtask(e){this.subtasks.push({id:ae(),title:e,completed:!1})}toggleSubtask(e){const t=this.subtasks.find(i=>i.id===e);t&&(t.completed=!t.completed)}removeSubtask(e){this.subtasks=this.subtasks.filter(t=>t.id!==e)}isOverdue(){if(!this.dueDateISO||this.completed)return!1;const e=new Date(this.dueDateISO),t=new Date;return t.setHours(0,0,0,0),e<t}isDueToday(){if(!this.dueDateISO)return!1;const e=new Date(this.dueDateISO),t=new Date;return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}toJSON(){return{...this}}static fromJSON(e){return new U(e)}}const he="tasks";class $e{constructor(e=$){this.storageAdapter=e,this._cache=null}_load(){if(this._cache)return this._cache;const e=this.storageAdapter.get(he,[]);return this._cache=e.map(t=>U.fromJSON(t)),this._cache}_persist(){this.storageAdapter.set(he,this._cache.map(e=>e.toJSON()))}getAll(){return[...this._load()]}getById(e){return this._load().find(t=>t.id===e)||null}getByListId(e){return this._load().filter(t=>t.listId===e)}add(e){return this._load().push(e),this._persist(),e}update(e){const t=this._load(),i=t.findIndex(r=>r.id===e.id);if(i===-1)throw new Error(`Task ${e.id} not found`);return t[i]=e,this._persist(),e}remove(e){this._cache=this._load().filter(t=>t.id!==e),this._persist()}removeCompleted(e=null){this._cache=this._load().filter(t=>!t.completed||e&&t.listId!==e),this._persist()}replaceAll(e){this._cache=e.map(t=>t instanceof U?t:U.fromJSON(t)),this._persist()}}const Ce=new $e;class q{constructor({id:e=ae(),name:t,color:i="#1ed760",icon:r="list",isDefault:s=!1}){if(!t||!t.trim())throw new Error("List name must not be empty");this.id=e,this.name=t.trim(),this.color=i,this.icon=r,this.isDefault=s}rename(e){if(!e.trim())throw new Error("List name must not be empty");this.name=e.trim()}toJSON(){return{...this}}static fromJSON(e){return new q(e)}}const pe="lists";class Be{constructor(e=$){this.storageAdapter=e,this._cache=null}_load(){if(this._cache)return this._cache;const e=this.storageAdapter.get(pe,null);return!e||e.length===0?(this._cache=[new q({id:"default",name:"کارهای من",color:"#1ed760",icon:"list",isDefault:!0})],this._persist(),this._cache):(this._cache=e.map(t=>q.fromJSON(t)),this._cache)}_persist(){this.storageAdapter.set(pe,this._cache.map(e=>e.toJSON()))}getAll(){return[...this._load()]}getById(e){return this._load().find(t=>t.id===e)||null}add(e){return this._load().push(e),this._persist(),e}update(e){const t=this._load(),i=t.findIndex(r=>r.id===e.id);if(i===-1)throw new Error(`List ${e.id} not found`);return t[i]=e,this._persist(),e}remove(e){this._cache=this._load().filter(t=>t.id!==e),this._persist()}replaceAll(e){this._cache=e.map(t=>t instanceof q?t:q.fromJSON(t)),this._persist()}}const Ie=new Be,ye={byDueDate:n=>[...n].sort((e,t)=>!e.dueDateISO&&!t.dueDateISO?0:e.dueDateISO?t.dueDateISO?new Date(e.dueDateISO)-new Date(t.dueDateISO):-1:1),byPriority:n=>{const e={high:0,medium:1,low:2};return[...n].sort((t,i)=>e[t.priority]-e[i.priority])},byCreatedDate:n=>[...n].sort((e,t)=>new Date(t.createdAtISO)-new Date(e.createdAtISO)),alphabetical:n=>[...n].sort((e,t)=>e.title.localeCompare(t.title,"fa"))};class Pe{constructor(e="byDueDate"){this.setStrategy(e)}setStrategy(e){if(!ye[e])throw new Error(`Unknown sort strategy: ${e}`);this.strategyKey=e,this.strategy=ye[e]}sort(e){return this.strategy(e)}}const X={vapidPublicKey:"BA18rkqe2tyTIL7tk7X-MjQ091fRxChBkeXUdzPSoFxEAbG1wTWosJNQ-IENoypAkhnrchn-KO_bteWOFPunZbE",apiBaseUrl:"https://task-reminders.mhkarami97.workers.dev"},R={botUsername:"my_easy_task_reminder_bot",apiBaseUrl:"https://task-reminders.mhkarami97.workers.dev"};function J(){const n=["fullscreen","standalone","minimal-ui"].some(i=>window.matchMedia(`(display-mode: ${i})`).matches),e=window.navigator.standalone===!0,t=document.referrer.startsWith("android-app://");return n||e||t}class je{isSupported(){return J()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window}_urlBase64ToUint8Array(e){const t="=".repeat((4-e.length%4)%4),i=(e+t).replace(/-/g,"+").replace(/_/g,"/"),r=window.atob(i),s=new Uint8Array(r.length);for(let a=0;a<r.length;a++)s[a]=r.charCodeAt(a);return s}async _getOrCreateSubscription(){const e=await navigator.serviceWorker.ready,t=await e.pushManager.getSubscription();return t||e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:this._urlBase64ToUint8Array(X.vapidPublicKey)})}async getActiveSubscription(){return"serviceWorker"in navigator?(await navigator.serviceWorker.ready).pushManager.getSubscription():null}async syncReminder(e,t,i){if(this.isSupported()&&Notification.permission==="granted")try{const r=await this._getOrCreateSubscription();await fetch(`${X.apiBaseUrl}/api/reminders/subscribe`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subscription:r.toJSON(),taskId:e,taskTitle:i,remindAtIso:t})})}catch(r){console.error("PushSubscriptionService syncReminder failed",r)}}async cancelReminder(e){if(this.isSupported())try{const i=await(await navigator.serviceWorker.ready).pushManager.getSubscription();if(!i)return;await fetch(`${X.apiBaseUrl}/api/reminders/unsubscribe`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({endpoint:i.endpoint,taskId:e})})}catch(t){console.error("[PushSubscriptionService] cancelReminder failed",t)}}async enable(){if(!this.isSupported())return"unsupported";const e=await Notification.requestPermission();if(e==="granted")try{await this._getOrCreateSubscription()}catch(t){return console.error("[PushSubscriptionService] subscribe failed",t),"error"}return e}async disableAll(){try{const e=await this.getActiveSubscription();return e&&await e.unsubscribe(),!0}catch(e){return console.error("[PushSubscriptionService] disableAll failed",e),!1}}}const F=new je,ve="telegramLinkCode",me="telegramEnabled";class Me{constructor(){this._linkCode=$.get(ve,null)}isConfigured(){return!!R.botUsername&&R.botUsername!=="YourTaskReminderBot"}isEnabled(){return $.get(me,!1)===!0}setEnabled(e){$.set(me,!!e)}getOrCreateLinkCode(){if(this._linkCode)return this._linkCode;const t=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`).replace(/-/g,"").slice(0,24);return this._linkCode=t,$.set(ve,t),t}getDeepLink(){const e=this.getOrCreateLinkCode();return`https://t.me/${R.botUsername}?start=${e}`}async getLinkStatus(){if(!this._linkCode)return{linked:!1};try{const e=`${R.apiBaseUrl}/api/telegram/link/status?code=${encodeURIComponent(this._linkCode)}`,t=await fetch(e);return t.ok?await t.json():{linked:!1}}catch(e){return console.error("[TelegramLinkService] getLinkStatus failed",e),{linked:!1}}}async unlink(){if(!this._linkCode)return this.setEnabled(!1),!0;try{return await fetch(`${R.apiBaseUrl}/api/telegram/unlink`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({linkCode:this._linkCode})}),this.setEnabled(!1),!0}catch(e){return console.error("[TelegramLinkService] unlink failed",e),!1}}async syncReminder(e,t,i){if(!(!this.isEnabled()||!this._linkCode))try{await fetch(`${R.apiBaseUrl}/api/telegram/reminders/subscribe`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({linkCode:this._linkCode,taskId:e,taskTitle:i,remindAtIso:t})})}catch(r){console.error("[TelegramLinkService] syncReminder failed",r)}}async cancelReminder(e){if(this._linkCode)try{await fetch(`${R.apiBaseUrl}/api/telegram/reminders/unsubscribe`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({linkCode:this._linkCode,taskId:e})})}catch(t){console.error("[TelegramLinkService] cancelReminder failed",t)}}}const L=new Me;class He{constructor(){this.timers=new Map}async requestPermission(){if(!("Notification"in window))return"unsupported";if(Notification.permission!=="default")return Notification.permission;const e=await Notification.requestPermission();return e==="granted"&&J()&&await F.enable(),e}computeFireAt(e){if(!e.dueTime)return console.warn(`NotificationService: task ${e.id} has no dueTime; reminder skipped`),null;const t=new Date(e.dueDateISO),[i,r]=e.dueTime.split(":").map(Number);return t.setHours(i,r,0,0),t.getTime()-e.reminderMinutesBefore*60*1e3}clearLocalTimer(e){const t=this.timers.get(e);t&&clearTimeout(t),this.timers.delete(e)}scheduleReminder(e){if(this.clearLocalTimer(e.id),!(e.dueDateISO&&e.reminderMinutesBefore!==null&&!e.completed)){this.cancelReminder(e.id);return}const i=this.computeFireAt(e);if(i===null)return;const r=i-Date.now();if(r>0){const a=setTimeout(()=>this.fire(e),r);this.timers.set(e.id,a)}else r>-6e5&&this.fire(e);const s=new Date(i).toISOString();J()&&F.syncReminder(e.id,s,e.title),L.syncReminder(e.id,s,e.title)}cancelReminder(e){this.clearLocalTimer(e),J()&&F.cancelReminder(e),L.cancelReminder(e)}fire(e){Notification.permission==="granted"&&new Notification("یادآور وظیفه",{body:e.title,icon:"./assets/icons/favicon-192.png",tag:e.id,dir:"rtl",lang:"fa"})}rescheduleAll(e){e.forEach(t=>this.scheduleReminder(t))}}const M=new He;class qe{constructor(){this.taskRepository=Ce,this.listRepository=Ie,this.sorter=new Pe("byDueDate"),M.rescheduleAll(this.taskRepository.getAll())}createTask(e){const t=new U(e);return this.taskRepository.add(t),M.scheduleReminder(t),S.emit(w.TASKS_CHANGED),t}updateTask(e,t){const i=this.taskRepository.getById(e);if(!i)throw new Error("Task not found");return Object.assign(i,t),this.taskRepository.update(i),M.scheduleReminder(i),S.emit(w.TASKS_CHANGED),i}toggleComplete(e){const t=this.taskRepository.getById(e);t&&(t.toggle(),t.completed&&t.repeat!=="none"&&this._spawnNextRecurrence(t),this.taskRepository.update(t),M.cancelReminder(e),S.emit(w.TASKS_CHANGED))}toggleStar(e){const t=this.taskRepository.getById(e);t&&(t.toggleStar(),this.taskRepository.update(t),S.emit(w.TASKS_CHANGED))}deleteTask(e){this.taskRepository.remove(e),M.cancelReminder(e),S.emit(w.TASKS_CHANGED)}clearCompleted(e=null){this.taskRepository.removeCompleted(e),S.emit(w.TASKS_CHANGED)}_spawnNextRecurrence(e){const t=new U({...e.toJSON(),id:void 0,completed:!1,completedAtISO:null,createdAtISO:new Date().toISOString(),dueDateISO:this._nextDueDate(e)});this.taskRepository.add(t),M.scheduleReminder(t)}_nextDueDate(e){if(!e.dueDateISO)return null;const t=new Date(e.dueDateISO);return e.repeat==="daily"&&t.setDate(t.getDate()+1),e.repeat==="weekly"&&t.setDate(t.getDate()+7),e.repeat==="monthly"&&t.setMonth(t.getMonth()+1),t.toISOString()}getTasksForList(e){return this.sorter.sort(this.taskRepository.getByListId(e))}getAllTasks(){return this.sorter.sort(this.taskRepository.getAll())}getTasksByDate(e){return this.taskRepository.getAll().filter(t=>t.dueDateISO?t.dueDateISO.slice(0,10)===e.slice(0,10):!1)}getTodayTasks(){const e=new Date().toISOString().slice(0,10);return this.getTasksByDate(e)}getStarredTasks(){return this.taskRepository.getAll().filter(e=>e.starred&&!e.completed)}getUpcomingTasks(){const e=new Date;return this.sorter.sort(this.taskRepository.getAll().filter(t=>!t.completed&&t.dueDateISO&&new Date(t.dueDateISO)>=e))}setSortStrategy(e){this.sorter.setStrategy(e),S.emit(w.TASKS_CHANGED)}getAllLists(){return this.listRepository.getAll()}createList(e,t){const i=new q({name:e,color:t});return this.listRepository.add(i),S.emit(w.LISTS_CHANGED),i}deleteList(e){if(e==="default")throw new Error("لیست پیش‌فرض قابل حذف نیست");this.taskRepository._load().filter(t=>t.listId===e).forEach(t=>this.taskRepository.remove(t.id)),this.listRepository.remove(e),S.emit(w.LISTS_CHANGED),S.emit(w.TASKS_CHANGED)}getStats(){const e=this.taskRepository.getAll();return{total:e.length,completed:e.filter(t=>t.completed).length,pending:e.filter(t=>!t.completed).length,overdue:e.filter(t=>t.isOverdue()).length}}}const D=new qe,le=(()=>{const n=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178],e=["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"],t=["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"],i=["ش","ی","د","س","چ","پ","ج"],r=(d,l)=>~~(d/l),s=(d,l)=>d-~~(d/l)*l;function a(d){var l=n.length,h=d+621,m=-14,T=n[0],C=0,O,B,W;if(d<T||d>=n[l-1])throw new Error("Invalid Jalali year "+d);for(W=1;W<l&&(O=n[W],C=O-T,!(d<O));W+=1)m+=r(C,33)*8+r(s(C,33),4),T=O;B=d-T,m+=r(B,33)*8+r(s(B,33)+3,4),s(C,33)===4&&C-B===4&&(m+=1);var xe=r(h,4)-r((r(h,100)+1)*3,4)-150,Le=20+m-xe;C-B<6&&(B=B-C+r(C+4,33)*33);var Q=s(s(B+1,33)-1,4);return Q===-1&&(Q=4),{leap:Q,gy:h,march:Le}}function c(d,l,h){var m=r((d+r(l-8,6)+100100)*1461,4)+r(153*s(l+9,12)+2,5)+h-34840408;return m-r(r(d+100100+r(l-8,6),100)*3,4)+752}function o(d){var l=4*d+139361631;l=l+r(r(4*d+183187720,146097)*3,4)*4-3908;var h=r(s(l,1461),4)*5+308,m=r(s(h,153),5)+1,T=s(r(h,153),12)+1,C=r(l,1461)-100100+r(8-T,6);return{gy:C,gm:T,gd:m}}function u(d,l,h){var m=a(d);return c(m.gy,3,m.march)+(l-1)*31-r(l,7)*(l-7)+h-1}function b(d){var l=o(d).gy,h=l-621,m=a(h),T=c(l,3,m.march),C=d-T,O;if(C>=0){if(C<=185)return{jy:h,jm:1+r(C,31),jd:s(C,31)+1};O=C-186}else h-=1,m=a(h),T=c(l-1,3,m.march),O=d-T-186;return{jy:h,jm:7+r(O,30),jd:s(O,30)+1}}function _(d,l,h){return b(c(d,l,h))}function y(d,l,h){return o(u(d,l,h))}function p(d){return a(d).leap===0}function E(d,l){return l<=6?31:l<=11||p(d)?30:29}class v{constructor(l,h,m){this.jy=l,this.jm=h,this.jd=m}static fromDate(l){var h=_(l.getFullYear(),l.getMonth()+1,l.getDate());return new v(h.jy,h.jm,h.jd)}static today(){return v.fromDate(new Date)}static fromISO(l){return l?v.fromDate(new Date(l)):null}toDate(){var l=y(this.jy,this.jm,this.jd);return new Date(l.gy,l.gm-1,l.gd)}toISODate(){var l=this.toDate(),h=m=>String(m).padStart(2,"0");return l.getFullYear()+"-"+h(l.getMonth()+1)+"-"+h(l.getDate())}toISOStringSafe(){var l=y(this.jy,this.jm,this.jd);return new Date(Date.UTC(l.gy,l.gm-1,l.gd,12,0,0)).toISOString()}get monthName(){return e[this.jm-1]}get weekdayIndex(){return(this.toDate().getDay()+1)%7}get weekdayName(){return t[this.weekdayIndex]}format(l){var h=m=>String(m).padStart(2,"0");return(l||"YYYY/MM/DD").replace("YYYY",this.jy).replace("MM",h(this.jm)).replace("DD",h(this.jd))}formatLong(){return this.weekdayName+" "+this.jd+" "+this.monthName+" "+this.jy}isSameDay(l){return!!l&&this.jy===l.jy&&this.jm===l.jm&&this.jd===l.jd}isToday(){return this.isSameDay(v.today())}addDays(l){var h=this.toDate();return h.setDate(h.getDate()+l),v.fromDate(h)}static monthNames(){return e}static weekdayShort(){return i}static monthLength(l,h){return E(l,h)}static isLeapYear(l){return p(l)}static get JalaliDate(){return v}static toJalali(l,h,m){return _(l,h,m)}static toGregorian(l,h,m){return y(l,h,m)}static isLeapJalaliYear(l){return p(l)}static jalaliMonthLength(l,h){return E(l,h)}}return v})(),{JalaliDate:Ue}=le,Ke='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',Fe='<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',Ge='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',Ve='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m9 12 2 2 4-4"/></svg>',Je='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',We='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';class Ye{constructor(e,t){this.root=e,this.sheet=t,this.currentListId="all",this.currentFilter="active",S.on(w.TASKS_CHANGED,()=>this.render()),S.on(w.LISTS_CHANGED,()=>this.render())}setList(e){this.currentListId=e,this.render()}_getTasks(){let e=this.currentListId==="all"?D.getAllTasks():D.getTasksForList(this.currentListId);return this.currentFilter==="active"&&(e=e.filter(t=>!t.completed)),this.currentFilter==="completed"&&(e=e.filter(t=>t.completed)),e}_renderChips(){const e=D.getAllLists();return`
      <div class="chip-row" id="list-chips">
        ${[{id:"all",name:"همه",color:"#b3b3b3"},...e.map(i=>({id:i.id,name:i.name,color:i.color}))].map(i=>`
          <button class="chip ${i.id===this.currentListId?"active":""}" data-list-id="${i.id}">
            <span class="chip__dot" style="background:${i.color}"></span>${i.name}
          </button>`).join("")}
        <button class="chip" id="add-list-chip">+ لیست جدید</button>
      </div>`}_renderFilterRow(){return`
      <div class="chip-row" id="filter-chips">
        ${[{id:"active",name:"فعال"},{id:"all",name:"همه"},{id:"completed",name:"انجام‌شده"}].map(t=>`<button class="chip ${t.id===this.currentFilter?"active":""}" data-filter-id="${t.id}">${t.name}</button>`).join("")}
      </div>`}_formatDue(e){if(!e.dueDateISO)return"";const t=Ue.fromISO(e.dueDateISO),i=e.isOverdue(),r=e.dueTime?` ${e.dueTime}`:"";return`<span class="task-item__due ${i?"overdue":""}">${Je}<span>${t.format("MM/DD")}${r}</span></span>`}_taskItemHTML(e){const t=e.starred?Fe:Ge,i=e.starred?"starred":"",r=e.subtasks.length?`<span class="task-item__subtasks">${We}<span>${e.subtasks.filter(s=>s.completed).length}/${e.subtasks.length}</span></span>`:"";return`
      <li class="task-item ${e.completed?"completed":""}" data-task-id="${e.id}">
        <button class="task-item__checkbox" data-action="toggle" aria-label="تغییر وضعیت">${Ke}</button>
        <div class="task-item__body" data-action="open">
          <p class="task-item__title">${this._escape(e.title)}</p>
          <div class="task-item__meta">
            <span class="priority-dot priority-dot--${e.priority}" title="اولویت"></span>
            ${this._formatDue(e)}
            ${r}
          </div>
        </div>
        <button class="btn--star ${i}" data-action="star" aria-label="نشان کردن">${t}</button>
      </li>`}_escape(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}render(){const e=this._getTasks(),t=this._groupByDate(e);this.root.innerHTML=`
      <div class="quick-add">
        <span class="quick-add__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </span>
        <input type="text" id="quick-add-input" placeholder="افزودن کار جدید..." />
        <button class="quick-add__submit" id="quick-add-btn" aria-label="افزودن کار">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
      </div>
      ${this._renderChips()}
      ${this._renderFilterRow()}
      <div id="task-groups">
        ${e.length===0?`<div class="empty-state">${Ve}<p>کاری برای نمایش نیست</p></div>`:Object.entries(t).map(([i,r])=>`
              <div class="task-section">
                <div class="task-section__header"><span class="task-section__title">${i}</span></div>
                <ul>${r.map(s=>this._taskItemHTML(s)).join("")}</ul>
              </div>`).join("")}
      </div>`,this._bindEvents()}_groupByDate(e){const t={"بدون تاریخ":[],"دیروز و قبل‌تر (عقب‌افتاده)":[],امروز:[],فردا:[],"این هفته":[],بعداً:[]},i=new Date;i.setHours(0,0,0,0);const r=new Date(i);r.setDate(i.getDate()+1);const s=new Date(i);return s.setDate(i.getDate()+7),e.forEach(a=>{if(!a.dueDateISO)return t["بدون تاریخ"].push(a);const c=new Date(a.dueDateISO);c.setHours(0,0,0,0),c<i?t["دیروز و قبل‌تر (عقب‌افتاده)"].push(a):c.getTime()===i.getTime()?t.امروز.push(a):c.getTime()===r.getTime()?t.فردا.push(a):c<s?t["این هفته"].push(a):t.بعداً.push(a)}),Object.fromEntries(Object.entries(t).filter(([,a])=>a.length>0))}_bindEvents(){var t,i;const e=this.root.querySelector("#quick-add-input");e==null||e.addEventListener("keydown",r=>{r.key==="Enter"&&e.value.trim()&&(D.createTask({title:e.value.trim(),listId:this.currentListId==="all"?"default":this.currentListId}),e.value="")}),(t=this.root.querySelector("#quick-add-btn"))==null||t.addEventListener("click",()=>{e.value.trim()?(D.createTask({title:e.value.trim(),listId:this.currentListId==="all"?"default":this.currentListId}),e.value=""):this.sheet.openTaskForm(null,this.currentListId)}),this.root.querySelectorAll("[data-list-id]").forEach(r=>r.addEventListener("click",()=>this.setList(r.dataset.listId))),this.root.querySelectorAll("[data-filter-id]").forEach(r=>r.addEventListener("click",()=>{this.currentFilter=r.dataset.filterId,this.render()})),(i=this.root.querySelector("#add-list-chip"))==null||i.addEventListener("click",()=>this.sheet.openListForm()),this.root.querySelectorAll(".task-item").forEach(r=>{const s=r.dataset.taskId;r.querySelector('[data-action="toggle"]').addEventListener("click",a=>{a.stopPropagation(),D.toggleComplete(s)}),r.querySelector('[data-action="star"]').addEventListener("click",a=>{a.stopPropagation(),D.toggleStar(s)}),r.querySelector('[data-action="open"]').addEventListener("click",()=>this.sheet.openTaskForm(s))})}}const{JalaliDate:x}=le,ze='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',Qe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',Xe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',Ze='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';class et{constructor(e){this.root=e,this.viewDate=x.today(),this.selectedDate=x.today(),S.on(w.TASKS_CHANGED,()=>this.render())}_monthMatrix(){const{jy:e,jm:t}=this.viewDate,i=x.monthLength(e,t),s=new x(e,t,1).weekdayIndex,a=[];for(let c=0;c<s;c+=1)a.push(null);for(let c=1;c<=i;c+=1)a.push(new x(e,t,c));for(;a.length%7!==0;)a.push(null);return a}_tasksCountByDay(e){return e?D.getTasksByDate(e.toISODate()).length:0}render(){const e=this._monthMatrix(),t=x.weekdayShort();this.root.innerHTML=`
      <div class="card">
        <div class="calendar-header">
          <button class="btn--icon" id="cal-prev" aria-label="ماه قبل" title="ماه قبل">${ze}</button>
          <span class="calendar-header__title">${this.viewDate.monthName} ${this.viewDate.jy}</span>
          <button class="btn--icon" id="cal-next" aria-label="ماه بعد" title="ماه بعد">${Qe}</button>
        </div>
        <div class="calendar-grid">
          ${t.map(i=>`<div class="calendar-grid__weekday">${i}</div>`).join("")}
          ${e.map(i=>{if(!i)return'<div class="calendar-day other-month"></div>';const r=["calendar-day"];i.isToday()&&r.push("today"),i.isSameDay(this.selectedDate)&&r.push("selected");const s=this._tasksCountByDay(i);return`<div class="${r.join(" ")}" data-jy="${i.jy}" data-jm="${i.jm}" data-jd="${i.jd}">
                <span>${i.jd}</span>${s>0?'<span class="calendar-day__dot"></span>':""}
              </div>`}).join("")}
        </div>
      </div>
      <div class="task-section" style="margin-top:20px;">
        <div class="task-section__header"><span class="task-section__title">${this.selectedDate.formatLong()}</span></div>
        <ul id="calendar-task-list">
          ${this._renderDayTasks()}
        </ul>
      </div>`,this._bindEvents()}_renderDayTasks(){const e=D.getTasksByDate(this.selectedDate.toISODate());return e.length===0?`<div class="empty-state">${Ze}<p>کاری برای این روز ثبت نشده است</p></div>`:e.map(t=>`
      <li class="task-item ${t.completed?"completed":""}" data-task-id="${t.id}">
        <button class="task-item__checkbox" data-action="toggle" aria-label="تغییر وضعیت">${Xe}</button>
        <div class="task-item__body">
          <p class="task-item__title">${t.title}</p>
          <div class="task-item__meta">
            <span class="priority-dot priority-dot--${t.priority}"></span>
            ${t.dueTime?`<span class="task-item__due">${t.dueTime}</span>`:""}
          </div>
        </div>
      </li>`).join("")}_bindEvents(){this.root.querySelector("#cal-prev").addEventListener("click",()=>{this.viewDate=this.viewDate.jm===1?new x(this.viewDate.jy-1,12,1):new x(this.viewDate.jy,this.viewDate.jm-1,1),this.render()}),this.root.querySelector("#cal-next").addEventListener("click",()=>{this.viewDate=this.viewDate.jm===12?new x(this.viewDate.jy+1,1,1):new x(this.viewDate.jy,this.viewDate.jm+1,1),this.render()}),this.root.querySelectorAll(".calendar-day[data-jy]").forEach(e=>{e.addEventListener("click",()=>{this.selectedDate=new x(Number(e.dataset.jy),Number(e.dataset.jm),Number(e.dataset.jd)),this.render()})}),this.root.querySelectorAll('[data-action="toggle"]').forEach(e=>{e.addEventListener("click",t=>{const i=t.target.closest(".task-item").dataset.taskId;D.toggleComplete(i)})})}}var tt="627723972815-qrp35936cvbodbo2udkp4qeeh6sgoqms.apps.googleusercontent.com",k={clientId:tt,scope:"https://www.googleapis.com/auth/drive.appdata",appFolder:"appDataFolder",appName:"persian-task-app",fileNamePrefix:"persian-task.backup.",keepVersions:3,autoBackupDebounceMs:15e3,pbkdf2Iterations:6e5,minPassphraseLength:8,dbName:"PersianTaskCloudDB",stateStorageKey:"persian-task-app:cloudSync:state"};function it(){return typeof crypto<"u"&&typeof crypto.subtle<"u"}function ne(n){for(var e=new Uint8Array(n),t="",i=e.byteLength,r=0;r<i;r++)t+=String.fromCharCode(e[r]);return btoa(t)}function oe(n){for(var e=atob(n),t=e.length,i=new Uint8Array(t),r=0;r<t;r++)i[r]=e.charCodeAt(r);return i.buffer}async function fe(n){var e=new TextEncoder,t=typeof n=="string"?e.encode(n):new Uint8Array(n),i=await crypto.subtle.digest("SHA-256",t),r=Array.from(new Uint8Array(i));return r.map(s=>s.toString(16).padStart(2,"0")).join("")}async function Te(n,e,t=k.pbkdf2Iterations){var i=new TextEncoder,r=await crypto.subtle.importKey("raw",i.encode(n),{name:"PBKDF2"},!1,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt:e,iterations:t,hash:"SHA-256"},r,{name:"AES-GCM",length:256},!1,["encrypt","decrypt"])}async function rt(n,e){var t=crypto.getRandomValues(new Uint8Array(12)),i=new TextEncoder,r=await crypto.subtle.encrypt({name:"AES-GCM",iv:t},e,i.encode(n));return{cipherText:ne(r),iv:ne(t)}}async function st(n,e,t){var i=oe(n),r=new Uint8Array(oe(e)),s=await crypto.subtle.decrypt({name:"AES-GCM",iv:r},t,i),a=new TextDecoder;return a.decode(s)}function z(n){if(n===null||typeof n!="object")return JSON.stringify(n);if(Array.isArray(n))return"["+n.map(z).join(",")+"]";var e=Object.keys(n).sort(),t=e.map(i=>JSON.stringify(i)+":"+z(n[i]));return"{"+t.join(",")+"}"}class g extends Error{constructor(e,t,i){super(t),this.name="CloudSyncError",this.code=e,this.cause=i}}function I(n){if(!n)return"خطای نامشخص";if(n instanceof g)switch(n.code){case"NETWORK_OFFLINE":return"اتصال اینترنت برقرار نیست.";case"AUTH_POPUP_BLOCKED":return"پنجره ورود به گوگل توسط مرورگر مسدود شد. لطفاً به این سایت اجازه باز کردن پاپ‌آپ بدهید.";case"AUTH_CANCELLED":return"فرآیند ورود به حساب گوگل لغو شد.";case"AUTH_TOKEN_EXPIRED":return"اعتبار ورود شما منقضی شده است؛ لطفاً دوباره متصل شوید.";case"DRIVE_PERMISSION_DENIED":return"دسترسی به پوشه اختصاصی برنامه در Google Drive امکان‌پذیر نیست.";case"PASSPHRASE_REQUIRED":return"این فایل پشتیبان دارای رمز است. لطفاً گذرواژه را وارد کنید.";case"PASSPHRASE_INVALID":return"گذرواژه واردشده نادرست است یا فایل آسیب دیده است.";case"CHECKSUM_MISMATCH":return"یکپارچگی فایل پشتیبان تأیید نشد؛ احتمال خرابی داده در انتقال.";case"INVALID_BACKUP_SCHEMA":return"ساختار فایل پشتیبان با این نسخه از برنامه همخوانی ندارد.";case"RATE_LIMITED":return"درخواست‌های مکرر به سرور گوگل محدود شدند؛ لطفاً چند دقیقه بعد تلاش کنید.";default:return n.message||"خطا در همگام‌سازی ابری."}if(typeof n=="object"&&n&&"message"in n){var e=String(n.message);return/network|failed to fetch/i.test(e)?"خطا در برقراری ارتباط با سرور گوگل. لطفاً اتصال اینترنت خود را بررسی کنید.":e}return String(n)}var ge=1,be="task-encrypted-backup";class at{constructor(e){this.keyVault=e}computeChecksum(e){var t=z(e);return fe(t)}async serialize(e,t=null){var i=z(e),r=await fe(i);if(t){var s=await rt(i,t),a=await this.keyVault.getSalt(),c={type:be,schemaVersion:ge,appName:k.appName,savedAt:new Date().toISOString(),algorithm:"AES-GCM-256",kdf:"PBKDF2-SHA256",iterations:k.pbkdf2Iterations,salt:a?ne(a):"",iv:s.iv,cipherText:s.cipherText,checksum:r};return{jsonText:JSON.stringify(c,null,2),checksum:r,isEncrypted:!0}}var o={schemaVersion:ge,appName:k.appName,savedAt:new Date().toISOString(),checksum:r,data:e};return{jsonText:JSON.stringify(o,null,2),checksum:r,isEncrypted:!1}}async deserialize(e,t={}){var i;try{i=JSON.parse(e)}catch(r){throw new g("INVALID_BACKUP_SCHEMA","فایل پشتیبان معتبر نیست.",r)}return i.type===be||i.cipherText?this._deserializeEncrypted(i,t):this._deserializePlain(i)}async _deserializePlain(e){if(!e||!e.data)throw new g("INVALID_BACKUP_SCHEMA","ساختار پشتیبان ابری نامعتبر است.");var t=e.data,i=e.checksum||await this.computeChecksum(t),r=await this.computeChecksum(t);if(i&&i!==r)throw new g("CHECKSUM_MISMATCH","چک‌سام فایل پشتیبان ابری همخوانی ندارد.");return{appData:t,isEncrypted:!1,checksum:r,savedAt:e.savedAt||new Date().toISOString()}}async _deserializeEncrypted(e,t={}){var i=t.cryptoKey;if(i||(i=await this.keyVault.getCryptoKey()),!i&&t.passphrase){if(!e.salt)throw new g("PASSPHRASE_INVALID","اطلاعات سالت در فایل رمزشده وجود ندارد.");var r=oe(e.salt),s=e.iterations||k.pbkdf2Iterations;i=await Te(t.passphrase,r,s)}if(!i)throw new g("PASSPHRASE_REQUIRED","برای رمزگشایی فایل ابری به گذرواژه نیاز است.");var a;try{a=await st(e.cipherText,e.iv,i)}catch(u){throw new g("PASSPHRASE_INVALID","رمزگشایی ناموفق بود؛ احتمال گذرواژه اشتباه است.",u)}var c;try{c=JSON.parse(a)}catch(u){throw new g("INVALID_BACKUP_SCHEMA","محتوای رمزگشایی‌شده معتبر نیست.",u)}var o=await this.computeChecksum(c);if(e.checksum&&e.checksum!==o)throw new g("CHECKSUM_MISMATCH","چک‌سام محتوای رمزگشایی‌شده همخوانی ندارد.");return{appData:c,isEncrypted:!0,checksum:o,savedAt:e.savedAt||new Date().toISOString()}}}var nt=k.dbName,ot=1,N="keys",j="snapshots",Z="activeEncryptionKey",ee="activeSalt",te="preRestoreSnapshot";class lt{constructor(){this._dbPromise=null}_getDb(){return this._dbPromise?this._dbPromise:(this._dbPromise=new Promise((e,t)=>{var i=indexedDB.open(nt,ot);i.onupgradeneeded=()=>{var r=i.result;r.objectStoreNames.contains(N)||r.createObjectStore(N),r.objectStoreNames.contains(j)||r.createObjectStore(j)},i.onsuccess=()=>e(i.result),i.onerror=()=>t(i.error)}),this._dbPromise)}async storeCryptoKey(e,t){var i=await this._getDb();return new Promise((r,s)=>{var a=i.transaction(N,"readwrite"),c=a.objectStore(N);c.put(e,Z),c.put(t,ee),a.oncomplete=()=>r(),a.onerror=()=>s(a.error)})}async getCryptoKey(){var e=await this._getDb();return new Promise((t,i)=>{var r=e.transaction(N,"readonly"),s=r.objectStore(N),a=s.get(Z);a.onsuccess=()=>t(a.result||null),a.onerror=()=>i(a.error)})}async getSalt(){var e=await this._getDb();return new Promise((t,i)=>{var r=e.transaction(N,"readonly"),s=r.objectStore(N),a=s.get(ee);a.onsuccess=()=>t(a.result||null),a.onerror=()=>i(a.error)})}async clearCryptoKey(){var e=await this._getDb();return new Promise((t,i)=>{var r=e.transaction(N,"readwrite"),s=r.objectStore(N);s.delete(Z),s.delete(ee),r.oncomplete=()=>t(),r.onerror=()=>i(r.error)})}async saveRollbackSnapshot(e){var t=await this._getDb();return new Promise((i,r)=>{var s=t.transaction(j,"readwrite"),a=s.objectStore(j);a.put({data:e,savedAt:Date.now()},te),s.oncomplete=()=>i(),s.onerror=()=>r(s.error)})}async getRollbackSnapshot(){var e=await this._getDb();return new Promise((t,i)=>{var r=e.transaction(j,"readonly"),s=r.objectStore(j),a=s.get(te);a.onsuccess=()=>t(a.result?a.result.data:null),a.onerror=()=>i(a.error)})}async clearRollbackSnapshot(){var e=await this._getDb();return new Promise((t,i)=>{var r=e.transaction(j,"readwrite"),s=r.objectStore(j);s.delete(te),r.oncomplete=()=>t(),r.onerror=()=>i(r.error)})}}var ct=new lt,f={DISCONNECTED:"disconnected",IDLE:"idle",SYNCING:"syncing",SUCCESS:"success",ERROR:"error",NEEDS_RECONNECT:"needs-reconnect",DECISION_PENDING:"decision-pending"};function ie(){return{connected:!1,userEmail:null,status:f.DISCONNECTED,lastSuccessfulBackupTime:null,lastAttemptTime:null,lastError:null,notifyFailures:!0,lastSyncedChecksum:null,encryptionEnabled:!1,hasRollbackSnapshot:!1,decision:null}}class dt{constructor(e=k.stateStorageKey){this.storageKey=e}load(){try{var e=localStorage.getItem(this.storageKey);if(!e)return ie();var t=JSON.parse(e);return{...ie(),...t}}catch{return ie()}}save(e){try{var t={connected:e.connected,userEmail:e.userEmail,status:e.status,lastSuccessfulBackupTime:e.lastSuccessfulBackupTime,lastAttemptTime:e.lastAttemptTime,lastError:e.lastError,notifyFailures:e.notifyFailures,lastSyncedChecksum:e.lastSyncedChecksum,encryptionEnabled:e.encryptionEnabled,hasRollbackSnapshot:e.hasRollbackSnapshot,decision:e.decision?{...e.decision,dismissed:!!e.decision.dismissed}:null};localStorage.setItem(this.storageKey,JSON.stringify(t))}catch(i){console.warn("Failed to save cloud sync state",i)}}clear(){localStorage.removeItem(this.storageKey)}}var ut=new dt,re="https://www.googleapis.com/drive/v3/files",ht="https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";class pt{constructor(e){this.authService=e}async _fetchWithAuth(e,t={}){var i=await this.authService.getAccessToken(!0);if(!i)throw new g("AUTH_TOKEN_EXPIRED","اعتبار توکن منقضی شده است.");var r=new Headers(t.headers||{});r.set("Authorization",`Bearer ${i}`);var s=await fetch(e,{...t,headers:r});if(s.status===401&&(this.authService.clearLocalToken(),i=await this.authService.getAccessToken(!0),r.set("Authorization",`Bearer ${i}`),s=await fetch(e,{...t,headers:r})),s.status===403){var a=await s.text();throw/rateLimitExceeded|userRateLimitExceeded/i.test(a)?new g("RATE_LIMITED","محدودیت تعداد درخواست گوگل."):new g("DRIVE_PERMISSION_DENIED","دسترسی به Google Drive مجاز نیست.")}if(!s.ok){var c=await s.text();throw new g("DRIVE_API_ERROR",`خطای درایو (${s.status}): ${c}`)}return s}async listBackups(){var e=k.fileNamePrefix,t=`'${k.appFolder}' in parents and trashed = false and name contains '${e}'`,i=new URLSearchParams({spaces:k.appFolder,q:t,fields:"files(id, name, modifiedTime, size, appProperties, description)",orderBy:"modifiedTime desc",pageSize:"30"}),r=await this._fetchWithAuth(`${re}?${i.toString()}`),s=await r.json();return(s.files||[]).filter(a=>a.name.startsWith(e))}async downloadFile(e){var t=await this._fetchWithAuth(`${re}/${e}?alt=media`);return t.text()}async uploadNewBackup(e,t,i={}){var r="-------314159265358979323846",s=`\r
--${r}\r
`,a=`\r
--${r}--`,c={name:e,parents:[k.appFolder],mimeType:"application/json",appProperties:{appName:k.appName,schemaVersion:String(i.schemaVersion||1),isEncrypted:String(!!i.isEncrypted),checksum:i.checksum||""}},o=s+`Content-Type: application/json; charset=UTF-8\r
\r
`+JSON.stringify(c)+s+`Content-Type: application/json; charset=UTF-8\r
\r
`+t+a,u=await this._fetchWithAuth(ht,{method:"POST",headers:{"Content-Type":`multipart/related; boundary=${r}`},body:o});return u.json()}async deleteFile(e){await this._fetchWithAuth(`${re}/${e}`,{method:"DELETE"})}async pruneOldBackups(e=k.keepVersions){var t=await this.listBackups();if(t.length<=e)return[];var i=t.slice(e),r=[];for(var s of i)try{await this.deleteFile(s.id),r.push(s.id)}catch(a){console.warn(`Failed to prune backup ${s.id}`,a)}return r}async deleteAllAppBackups(){var e=await this.listBackups();for(var t of e)try{await this.deleteFile(t.id)}catch(i){console.warn(`Failed to delete backup ${t.id}`,i)}}}var ke="https://accounts.google.com/gsi/client";class yt{constructor(){this._loadPromise=null}load(){var e,t;return typeof window>"u"?Promise.reject(new g("SSR_NOT_SUPPORTED","Google Identity can only be loaded in a browser environment.")):(t=(e=window.google)==null?void 0:e.accounts)!=null&&t.oauth2?Promise.resolve(window.google):this._loadPromise?this._loadPromise:(this._loadPromise=new Promise((i,r)=>{var s=document.querySelector(`script[src="${ke}"]`);if(s){s.addEventListener("load",()=>i(window.google)),s.addEventListener("error",()=>r(new g("GIS_LOAD_FAILED","Failed to load Google Identity script.")));return}var a=document.createElement("script");a.src=ke,a.async=!0,a.defer=!0,a.onload=()=>{var c,o;(o=(c=window.google)==null?void 0:c.accounts)!=null&&o.oauth2?i(window.google):r(new g("GIS_INIT_FAILED","Google Identity script loaded without oauth2."))},a.onerror=()=>{this._loadPromise=null,r(new g("GIS_LOAD_FAILED","خطا در بارگذاری اسکریپت احراز هویت گوگل."))},document.head.appendChild(a)}),this._loadPromise)}}var _e=new yt;class vt{constructor(e=k.clientId,t=k.scope){this.clientId=e,this.scope=t,this.tokenClient=null,this.accessToken=null,this.tokenExpiresAt=0}async init(){if(!this.tokenClient){var e=await _e.load();this.tokenClient=e.accounts.oauth2.initTokenClient({client_id:this.clientId,scope:this.scope,callback:()=>{}})}}hasValidToken(){return!!(this.accessToken&&Date.now()<this.tokenExpiresAt-6e4)}async requestToken(e=""){return await this.init(),new Promise((t,i)=>{this.tokenClient.callback=r=>{if(r.error){r.error==="access_denied"?i(new g("AUTH_CANCELLED","ورود به حساب گوگل لغو شد.")):r.error==="popup_blocked_by_browser"?i(new g("AUTH_POPUP_BLOCKED","پنجره پاپ‌آپ توسط مرورگر مسدود شد.")):i(new g("AUTH_FAILED",r.error_description||r.error));return}this.accessToken=r.access_token;var s=Number(r.expires_in)||3599;this.tokenExpiresAt=Date.now()+s*1e3,t(this.accessToken)},this.tokenClient.error_callback=r=>{i(new g("AUTH_FAILED",(r==null?void 0:r.message)||"خطا در احراز هویت گوگل."))};try{this.tokenClient.requestAccessToken({prompt:e})}catch(r){i(new g("AUTH_REQUEST_FAILED","درخواست توکن ناموفق بود.",r))}})}async getAccessToken(e=!0){if(this.hasValidToken())return this.accessToken;if(!e)try{return await this.requestToken("none")}catch{return null}return this.requestToken("")}async revoke(){var e=this.accessToken;if(this.accessToken=null,this.tokenExpiresAt=0,!!e)try{var t=await _e.load();await new Promise(i=>{t.accounts.oauth2.revoke(e,()=>i())})}catch(i){console.warn("Revoke token failed",i)}}clearLocalToken(){this.accessToken=null,this.tokenExpiresAt=0}}var mt=new vt;function ft(n,e){var t=Array.isArray(n==null?void 0:n.lists)?n.lists:[],i=Array.isArray(e==null?void 0:e.lists)?e.lists:[],r=new Map;t.forEach(o=>{o&&o.id&&r.set(o.id,JSON.parse(JSON.stringify(o)))}),i.forEach(o=>{if(!(!o||!o.id)){if(!r.has(o.id)){r.set(o.id,JSON.parse(JSON.stringify(o)));return}var u=r.get(o.id);r.set(o.id,{...u,name:o.name||u.name,color:o.color||u.color,icon:o.icon||u.icon,isDefault:!!(u.isDefault||o.isDefault)})}}),r.has("default")||r.set("default",{id:"default",name:"کارهای من",color:"#1ed760",icon:"list",isDefault:!0});var s=Array.isArray(n==null?void 0:n.tasks)?n.tasks:[],a=Array.isArray(e==null?void 0:e.tasks)?e.tasks:[],c=new Map;return s.forEach(o=>{o&&o.id&&c.set(o.id,JSON.parse(JSON.stringify(o)))}),a.forEach(o=>{if(!(!o||!o.id)){if(!c.has(o.id)){c.set(o.id,JSON.parse(JSON.stringify(o)));return}var u=c.get(o.id),b=new Map;(u.subtasks||[]).forEach(v=>{v&&v.id&&b.set(v.id,{...v})}),(o.subtasks||[]).forEach(v=>{if(!(!v||!v.id))if(!b.has(v.id))b.set(v.id,{...v});else{var d=b.get(v.id);b.set(v.id,{...d,title:v.title||d.title,completed:!!(d.completed||v.completed)})}});var _=u.completedAtISO?new Date(u.completedAtISO).getTime():0,y=o.completedAtISO?new Date(o.completedAtISO).getTime():0,p=_>=y?u.completed:o.completed,E=_>=y?u.completedAtISO:o.completedAtISO;c.set(o.id,{...u,title:o.title||u.title,notes:o.notes!==void 0?o.notes:u.notes,listId:r.has(o.listId)?o.listId:u.listId,dueDateISO:o.dueDateISO||u.dueDateISO,dueTime:o.dueTime||u.dueTime,priority:o.priority||u.priority,completed:p,completedAtISO:E,repeat:o.repeat||u.repeat,starred:!!(u.starred||o.starred),reminderMinutesBefore:o.reminderMinutesBefore!==void 0?o.reminderMinutesBefore:u.reminderMinutesBefore,subtasks:Array.from(b.values())})}}),{lists:Array.from(r.values()),tasks:Array.from(c.values())}}class gt{constructor(e={}){this.authService=e.authService||mt,this.driveClient=e.driveClient||new pt(this.authService),this.keyVault=e.keyVault||ct,this.stateStorage=e.stateStorage||ut,this.codec=e.codec||new at(this.keyVault),this.taskRepo=e.taskRepo||Ce,this.listRepo=e.listRepo||Ie,this.state=this.stateStorage.load(),this._listeners=[],this._autoBackupTimeout=null,this._isPerformingSync=!1,this._unsubEvents=[]}getState(){return{...this.state}}subscribe(e){return this._listeners.push(e),e(this.getState()),()=>{this._listeners=this._listeners.filter(t=>t!==e)}}_notify(){var e=this.getState();this.stateStorage.save(e),this._listeners.forEach(t=>{try{t(e)}catch(i){console.error("CloudSyncService listener error",i)}})}_patchState(e){this.state={...this.state,...e},this._notify()}getLocalData(){return{lists:this.listRepo.getAll().map(e=>e.toJSON()),tasks:this.taskRepo.getAll().map(e=>e.toJSON())}}async applyRestoredData(e){Array.isArray(e.lists)&&this.listRepo.replaceAll(e.lists),Array.isArray(e.tasks)&&this.taskRepo.replaceAll(e.tasks),M.rescheduleAll(this.taskRepo.getAll()),S.emit(w.LISTS_CHANGED),S.emit(w.TASKS_CHANGED)}countTotalItems(e){return Array.isArray(e==null?void 0:e.tasks)?e.tasks.length:0}async start(){var e=!!await this.keyVault.getRollbackSnapshot(),t=await this.keyVault.getCryptoKey();this._patchState({hasRollbackSnapshot:e,encryptionEnabled:!!t}),this._unsubEvents.forEach(i=>i()),this._unsubEvents=[S.on(w.TASKS_CHANGED,()=>this.scheduleAutoBackup()),S.on(w.LISTS_CHANGED,()=>this.scheduleAutoBackup())],typeof window<"u"&&(window.addEventListener("online",()=>{this.state.connected&&this.scheduleAutoBackup(1e3)}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&this.state.connected&&this.scheduleAutoBackup(2e3)})),this.state.connected&&typeof navigator<"u"&&navigator.onLine&&this.silentStartupCheck()}async connect(){this._patchState({status:f.SYNCING,lastError:null});try{await this.authService.getAccessToken(!0),this._patchState({connected:!0,status:f.IDLE,lastError:null}),await this.syncCheckOnConnect()}catch(e){throw this._patchState({status:f.ERROR,lastError:I(e)}),e}}async disconnect(e=!1){this._patchState({status:f.SYNCING});try{if(e)try{await this.driveClient.deleteAllAppBackups()}catch(t){console.warn("Failed to delete remote backups on disconnect",t)}await this.authService.revoke(),await this.keyVault.clearCryptoKey(),await this.keyVault.clearRollbackSnapshot(),this._patchState({connected:!1,status:f.DISCONNECTED,lastError:null,lastSyncedChecksum:null,encryptionEnabled:!1,hasRollbackSnapshot:!1,decision:null})}catch(t){throw this._patchState({status:f.ERROR,lastError:I(t)}),t}}async silentStartupCheck(){try{var e=await this.authService.getAccessToken(!1);if(!e){this._patchState({status:f.NEEDS_RECONNECT});return}await this.syncCheckOnConnect()}catch{typeof navigator<"u"&&navigator.onLine&&this._patchState({status:f.NEEDS_RECONNECT})}}async syncCheckOnConnect(){var y,p;try{this._patchState({status:f.SYNCING});var e=await this.driveClient.listBackups();if(e.length===0){await this.performBackup();return}var t=e[0],i=this.getLocalData(),r=await this.codec.computeChecksum(i),s=(y=t.appProperties)==null?void 0:y.checksum;if(s&&s===r){this._patchState({status:f.SUCCESS,lastSuccessfulBackupTime:t.modifiedTime||new Date().toISOString(),lastSyncedChecksum:r,decision:null});return}var a=this.countTotalItems(i),c=((p=t.appProperties)==null?void 0:p.isEncrypted)==="true",o=a;try{var u=await this.driveClient.downloadFile(t.id),b=await this.codec.deserialize(u,{});o=this.countTotalItems(b.appData)}catch{}var _="newer-remote";a===0&&o>0?_="remote-only":this.state.lastSyncedChecksum&&this.state.lastSyncedChecksum!==r&&(_="conflict"),this._patchState({status:f.DECISION_PENDING,decision:{kind:_,remote:t,localItemsCount:a,remoteItemsCount:o,remoteEncrypted:c,dismissed:!1}})}catch(E){this._patchState({status:f.ERROR,lastError:I(E)})}}scheduleAutoBackup(e=k.autoBackupDebounceMs){this.state.connected&&(this._autoBackupTimeout&&clearTimeout(this._autoBackupTimeout),this._autoBackupTimeout=setTimeout(()=>{this.performBackup().catch(t=>{console.warn("Auto backup error",t)})},e))}async performBackup(){if(this.state.connected&&!this._isPerformingSync){this._isPerformingSync=!0,this._patchState({status:f.SYNCING,lastAttemptTime:new Date().toISOString()});try{var e=this.getLocalData(),t=await this.keyVault.getCryptoKey(),i=await this.codec.serialize(e,t);if(this.state.lastSyncedChecksum&&this.state.lastSyncedChecksum===i.checksum){this._patchState({status:f.SUCCESS,lastError:null}),this._isPerformingSync=!1;return}var r=new Date().toISOString().replace(/[:.]/g,"-"),s=`${k.fileNamePrefix}${r}.json`;await this.driveClient.uploadNewBackup(s,i.jsonText,{schemaVersion:1,isEncrypted:i.isEncrypted,checksum:i.checksum}),await this.driveClient.pruneOldBackups(k.keepVersions),this._patchState({status:f.SUCCESS,lastSuccessfulBackupTime:new Date().toISOString(),lastSyncedChecksum:i.checksum,lastError:null,decision:null})}catch(c){var a=f.ERROR;throw c instanceof g&&c.code==="AUTH_TOKEN_EXPIRED"&&(a=f.NEEDS_RECONNECT),this._patchState({status:a,lastError:I(c)}),c}finally{this._isPerformingSync=!1}}}async resolveRestore(e="replace",t=""){var i=this.state.decision;if(i){this._patchState({status:f.SYNCING});try{var r=await this.driveClient.downloadFile(i.remote.id),s=await this.codec.deserialize(r,{passphrase:t}),a=this.getLocalData();await this.keyVault.saveRollbackSnapshot(a);var c;e==="merge"?c=ft(a,s.appData):c=s.appData,await this.applyRestoredData(c);var o=await this.codec.computeChecksum(c);this._patchState({status:f.SUCCESS,lastSuccessfulBackupTime:new Date().toISOString(),lastSyncedChecksum:o,hasRollbackSnapshot:!0,decision:null,lastError:null}),await this.performBackup()}catch(u){throw this._patchState({status:f.ERROR,lastError:I(u)}),u}}}async resolveKeepLocal(){this._patchState({decision:null}),await this.performBackup()}dismissDecision(){this.state.decision&&this._patchState({decision:{...this.state.decision,dismissed:!0},status:f.IDLE})}reopenDecision(){this.state.decision&&this._patchState({decision:{...this.state.decision,dismissed:!1},status:f.DECISION_PENDING})}async enableEncryption(e){if(!it())throw new g("CRYPTO_UNSUPPORTED","مرورگر شما از Web Crypto پشتیبانی نمی‌کند.");if(!e||e.length<k.minPassphraseLength)throw new g("PASSPHRASE_TOO_SHORT",`گذرواژه باید حداقل ${k.minPassphraseLength} نویسه باشد.`);var t=crypto.getRandomValues(new Uint8Array(16)),i=await Te(e,t);await this.keyVault.storeCryptoKey(i,t.buffer),this._patchState({encryptionEnabled:!0}),this.state.connected&&await this.performBackup()}async disableEncryption(){await this.keyVault.clearCryptoKey(),this._patchState({encryptionEnabled:!1}),this.state.connected&&await this.performBackup()}async rollbackLastRestore(){var e=await this.keyVault.getRollbackSnapshot();if(!e)throw new g("NO_ROLLBACK","هیچ نسخه‌ای برای بازگردانی وجود ندارد.");await this.applyRestoredData(e),await this.keyVault.clearRollbackSnapshot(),this._patchState({hasRollbackSnapshot:!1,lastError:null}),this.state.connected&&await this.performBackup()}setNotifyFailures(e){this._patchState({notifyFailures:!!e})}exportLocalJson(){var e=this.getLocalData(),t={appName:k.appName,exportedAt:new Date().toISOString(),data:e},i=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),r=URL.createObjectURL(i),s=document.createElement("a");s.href=r,s.download=`tasks-backup-${Date.now()}.json`,s.click(),URL.revokeObjectURL(r)}async importLocalJson(e){var t=await e.text(),i=JSON.parse(t),r=i.data||i;if(!r.tasks&&!r.lists)throw new Error("ساختار فایل پشتیبان معتبر نیست.");await this.applyRestoredData(r),this.state.connected&&await this.performBackup()}}var Ae=new gt;function Se(n){if(!n)return"";try{var e=new Date(n);return isNaN(e.getTime())?"":new Intl.DateTimeFormat("fa-IR-u-ca-persian",{dateStyle:"medium",timeStyle:"short"}).format(e)}catch{return String(n)}}class bt{constructor(){this.service=Ae,this.dismissedFailureKey="",this._isRetrying=!1,this._modalEl=null,this._barEl=null,this.service.subscribe(()=>{this.updateFailureBar(),this.updateConflictModal()})}updateFailureBar(){var s,a;var e=this.service.getState(),t=e.connected&&e.notifyFailures&&typeof navigator<"u"&&navigator.onLine&&(e.status===f.NEEDS_RECONNECT||e.status===f.ERROR&&!!e.lastError),i=`${e.status}|${e.lastError??""}`;if(!t||this.dismissedFailureKey===i){this._barEl&&(this._barEl.remove(),this._barEl=null);return}var r=e.status===f.NEEDS_RECONNECT?"اعتبار اتصال به Google Drive منقضی شده است. وظایف همگام‌سازی نشدند.":e.lastError||"خطا در همگام‌سازی با Google Drive.";this._barEl||(this._barEl=document.createElement("aside"),this._barEl.className="sync-failure-bar",this._barEl.setAttribute("role","status"),this._barEl.setAttribute("aria-live","polite"),document.body.appendChild(this._barEl)),this._barEl.innerHTML=`
      <div class="sync-failure-bar__text">
        <span aria-hidden="true">⚠️</span>
        <span>${r}</span>
      </div>
      <div class="sync-failure-bar__actions">
        <button type="button" class="sync-failure-bar__retry" id="sync-retry-btn">
          ${this._isRetrying?"در حال تلاش...":"تلاش دوباره"}
        </button>
        <button type="button" class="sync-failure-bar__close" id="sync-dismiss-btn" title="بستن" aria-label="بستن">✕</button>
      </div>
    `,(s=document.getElementById("sync-dismiss-btn"))==null||s.addEventListener("click",()=>{this.dismissedFailureKey=i,this.updateFailureBar()}),(a=document.getElementById("sync-retry-btn"))==null||a.addEventListener("click",async()=>{if(!this._isRetrying){this._isRetrying=!0,this.updateFailureBar();try{await this.service.connect()}catch{}finally{this._isRetrying=!1,this.updateFailureBar()}}})}updateConflictModal(){var o,u,b,_;var e=this.service.getState(),t=e.decision,i=!!(t&&!t.dismissed);if(!i){this._modalEl&&(this._modalEl.remove(),this._modalEl=null);return}this._modalEl||(this._modalEl=document.createElement("div"),this._modalEl.className="cloud-modal-backdrop",this._modalEl.setAttribute("role","dialog"),this._modalEl.setAttribute("aria-modal","true"),document.body.appendChild(this._modalEl));var r="نسخه‌ی جدیدتری در Google Drive هست",s="دیتای این دستگاه تغییری نکرده است و نسخه‌ی ابری جدیدتر است.";t.kind==="conflict"?(r="تفاوت بین دیتای این دستگاه و Google Drive",s="هم این دستگاه و هم نسخه‌ی ابری از آخرین همگام‌سازی تغییر کرده‌اند. یکی از گزینه‌های زیر را انتخاب کنید."):t.kind==="remote-only"&&(r="پشتیبان ابری پیدا شد",s="این دستگاه هنوز کاری ندارد، اما در Google Drive شما نسخه‌ی پشتیبان پیدا شد. مایل به بازیابی هستید؟");var a=t.kind==="conflict"?"merge":"replace",c=!!(t.remoteEncrypted&&!e.encryptionEnabled);this._modalEl.innerHTML=`
      <div class="cloud-modal-content">
        <div class="cloud-modal-header">
          <h3>${r}</h3>
          <button type="button" id="conflict-close-btn" aria-label="بستن">✕</button>
        </div>

        <p class="text-secondary" style="font-size:0.8rem; line-height:1.6; margin:0">
          ${s}
        </p>

        <div class="cloud-stats-box">
          <div class="cloud-stats-row">
            <span class="text-secondary">تاریخ آخرین نسخه ابری:</span>
            <strong>${Se(t.remote.modifiedTime)}</strong>
          </div>
          <div class="cloud-stats-row">
            <span class="text-secondary">تعداد وظایف در Drive:</span>
            <strong style="color:var(--color-accent)">${t.remoteItemsCount}</strong>
          </div>
          <div class="cloud-stats-row">
            <span class="text-secondary">تعداد وظایف در این دستگاه:</span>
            <strong>${t.localItemsCount}</strong>
          </div>
          <div class="cloud-stats-row">
            <span class="text-secondary">نوع ذخیره‌سازی ابری:</span>
            <strong>${t.remoteEncrypted?"🔒 رمزنگاری‌شده (AES-GCM)":"ساده (بدون رمز)"}</strong>
          </div>
        </div>

        ${c?`
          <div class="field" style="margin-bottom:0">
            <label class="field__label">گذرواژه رمزگشایی فایل ابری:</label>
            <input class="field__input" type="password" id="conflict-passphrase-input" placeholder="گذرواژه‌ای که قبلاً تعیین کردید..." />
          </div>`:""}

        <div>
          <label class="field__label" style="margin-bottom:8px">نحوه اعمال نسخه ابری:</label>
          <div class="cloud-mode-options">
            <label class="cloud-mode-label ${a==="merge"?"active":""}" id="label-mode-merge">
              <input type="radio" name="conflict-mode" value="merge" ${a==="merge"?"checked":""} />
              <div>
                <b style="color:var(--color-accent); font-size:0.82rem; display:block">ادغام هوشمند (Merge)</b>
                <span class="text-secondary" style="font-size:0.72rem; line-height:1.4">کارها و لیست‌های دو طرف تلفیق می‌شوند.</span>
              </div>
            </label>
            <label class="cloud-mode-label ${a==="replace"?"active":""}" id="label-mode-replace">
              <input type="radio" name="conflict-mode" value="replace" ${a==="replace"?"checked":""} />
              <div>
                <b style="color:var(--color-negative); font-size:0.82rem; display:block">جایگزینی کامل (Replace)</b>
                <span class="text-secondary" style="font-size:0.72rem; line-height:1.4">دیتای این دستگاه دقیقاً با نسخه ابری جایگزین می‌شود.</span>
              </div>
            </label>
          </div>
          <p class="field__hint" style="margin-top:6px; font-size:0.72rem">
            * پیش از بازیابی، یک نسخه پشتیبان محلی از دیتای فعلی ذخیره می‌شود تا در صورت نیاز بتوانید آن را بازگردانید.
          </p>
        </div>

        <div id="conflict-error-box" style="display:none; color:var(--color-negative); font-size:0.78rem; font-weight:700"></div>

        <div style="display:flex; flex-direction:column-reverse; gap:8px; margin-top:4px">
          <button type="button" class="btn btn--outline btn--block" id="conflict-later-btn">بعداً</button>
          ${t.localItemsCount>0?'<button type="button" class="btn btn--secondary btn--block" id="conflict-keep-btn">نگه‌داشتن دیتای این دستگاه</button>':""}
          <button type="button" class="btn btn--primary btn--block" id="conflict-restore-btn">بازیابی از Google Drive</button>
        </div>
      </div>
    `,this._modalEl.querySelectorAll('input[name="conflict-mode"]').forEach(y=>{y.addEventListener("change",p=>{var E,v;this._modalEl.querySelectorAll(".cloud-mode-label").forEach(d=>d.classList.remove("active")),p.target.value==="merge"?(E=document.getElementById("label-mode-merge"))==null||E.classList.add("active"):(v=document.getElementById("label-mode-replace"))==null||v.classList.add("active")})}),(o=document.getElementById("conflict-close-btn"))==null||o.addEventListener("click",()=>{this.service.dismissDecision()}),(u=document.getElementById("conflict-later-btn"))==null||u.addEventListener("click",()=>{this.service.dismissDecision()}),(b=document.getElementById("conflict-keep-btn"))==null||b.addEventListener("click",async()=>{var y=document.getElementById("conflict-keep-btn");y&&(y.disabled=!0);try{await this.service.resolveKeepLocal(),alert("دیتای این دستگاه در Google Drive ذخیره شد.")}catch(p){this._showConflictError(I(p))}finally{y&&(y.disabled=!1)}}),(_=document.getElementById("conflict-restore-btn"))==null||_.addEventListener("click",async()=>{var y=document.getElementById("conflict-restore-btn"),p=document.getElementById("conflict-passphrase-input"),E=p?p.value:"",v=this._modalEl.querySelector('input[name="conflict-mode"]:checked'),d=v?v.value:"replace";y&&(y.disabled=!0,y.textContent="در حال بازیابی...");try{await this.service.resolveRestore(d,E),alert("وظایف با موفقیت از Google Drive بازیابی شدند.")}catch(l){this._showConflictError(I(l))}finally{y&&(y.disabled=!1,y.textContent="بازیابی از Google Drive")}})}_showConflictError(e){var t=document.getElementById("conflict-error-box");t&&(t.textContent=e,t.style.display="block")}getCardHTML(){var e=this.service.getState(),t="cloud-badge--neutral",i="قطع";switch(e.status){case"idle":case"success":t=e.connected?"cloud-badge--success":"cloud-badge--neutral",i=e.connected?"متصل و آماده":"قطع";break;case"syncing":t="cloud-badge--syncing",i="در حال همگام‌سازی...";break;case"needs-reconnect":t="cloud-badge--warning",i="نیاز به اتصال دوباره";break;case"decision-pending":t="cloud-badge--warning",i="در انتظار تصمیم کاربر";break;case"error":t="cloud-badge--error",i="خطا در همگام‌سازی";break}var r=e.lastSuccessfulBackupTime?Se(e.lastSuccessfulBackupTime):"تاکنون انجام نشده";return`
      <div class="card about-section cloud-card" id="cloud-backup-card">
        <div class="cloud-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.3rem">☁️</span>
            <h3 style="margin:0">پشتیبان‌گیری در Google Drive</h3>
          </div>
          <span class="cloud-badge ${t}" id="cloud-status-badge">${i}</span>
        </div>

        <p class="text-secondary" style="font-size:0.78rem; line-height:1.6; margin:0">
          پشتیبان‌گیری در پوشه امن و اختصاصی همین برنامه در درایو شما (appDataFolder) انجام می‌شود.
          پس از هر تغییر وظایف یا لیست‌ها، پشتیبان‌گیری به‌صورت خودکار اجرا می‌شود.
        </p>

        <div class="cloud-info-panel">
          <div style="display:flex; justify-content:space-between">
            <span class="text-secondary">وضعیت اتصال:</span>
            <strong>${i}</strong>
          </div>
          ${e.connected?`
            <div style="display:flex; justify-content:space-between">
              <span class="text-secondary">آخرین همگام‌سازی موفق:</span>
              <strong>${r}</strong>
            </div>`:""}
          ${e.connected&&e.lastError&&e.status!=="error"?`<div style="color:var(--color-negative); font-size:0.75rem">${e.lastError}</div>`:""}
        </div>

        <!-- دکمه‌های عملیات اصلی -->
        <div class="cloud-actions-row">
          ${e.connected?`
              ${e.status==="needs-reconnect"||e.status==="error"?'<button type="button" class="btn btn--outline" id="cloud-reconnect-btn">🔄 اتصال دوباره</button>':""}
              ${e.decision&&e.decision.dismissed?'<button type="button" class="btn btn--outline" id="cloud-check-remote-btn">☁️ بررسی نسخه ابری</button>':""}
              <button type="button" class="btn btn--primary" id="cloud-backup-now-btn" ${e.status==="syncing"?"disabled":""}>
                🔄 پشتیبان‌گیری همین حالا
              </button>
              <button type="button" class="btn btn--danger" id="cloud-disconnect-btn">قطع اتصال</button>
            `:'<button type="button" class="btn btn--primary" id="cloud-connect-btn">🔗 اتصال به Google Drive</button>'}
        </div>

        <!-- پنل رمزنگاری سرتاسری اختیاری (Zero-Knowledge) -->
        <div class="cloud-crypto-panel">
          <div style="display:flex; align-items:center; gap:6px;">
            <span>🔐</span>
            <b>رمزنگاری سرتاسری اختیاری (Zero-Knowledge)</b>
          </div>

          ${e.encryptionEnabled?`
            <div style="color:var(--color-accent); font-weight:700">
              ✓ رمزنگاری AES-GCM ۲۵۶ فعال است.
            </div>
            <p class="text-secondary" style="font-size:0.75rem; margin:0">
              داده‌ها پیش از خروج از دستگاه شما رمز می‌شوند و حتی گوگل هم به محتوای کارهای شما دسترسی ندارد.
            </p>
            <button type="button" class="btn btn--outline" id="cloud-disable-enc-btn" style="align-self:flex-start; margin-top:4px">
              غیرفعال‌سازی رمزنگاری
            </button>`:`
            <p class="text-secondary" style="font-size:0.75rem; margin:0">
              با فعال‌سازی رمزنگاری، فایل‌ها با کلید مشتق‌شده از گذرواژه شما (PBKDF2 با ۶۰۰٬۰۰۰ دور) رمز می‌شوند.
              <b style="color:var(--color-negative); display:block; margin-top:4px">هشدار: در صورت فراموشی گذرواژه، اطلاعات ابری هرگز قابل بازیابی نخواهد بود.</b>
            </p>
            <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px">
              <input class="field__input" type="password" id="cloud-enc-pass" placeholder="گذرواژه قوی (حداقل ${k.minPassphraseLength} نویسه)..." />
              <input class="field__input" type="password" id="cloud-enc-pass-confirm" placeholder="تکرار همان گذرواژه..." />
              <button type="button" class="btn btn--outline" id="cloud-enable-enc-btn" style="align-self:flex-start">
                🛡️ فعال‌سازی رمزنگاری
              </button>
            </div>`}
        </div>

        <!-- تنظیمات اعلان و بازگردانی Rollback -->
        <div style="margin-top:var(--space-3); display:flex; flex-direction:column; gap:8px; font-size:0.75rem">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer">
            <input type="checkbox" id="cloud-notify-failures-check" ${e.notifyFailures?"checked":""} />
            <span>نمایش نوار هشدار پایین صفحه در صورت عدم موفقیت همگام‌سازی (فقط در حالت آنلاین)</span>
          </label>

          ${e.hasRollbackSnapshot?`
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--surface-2); padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--border)">
              <span class="text-secondary">پیش از آخرین بازیابی ابری، نسخه‌ی محلی ذخیره شده است.</span>
              <button type="button" class="btn btn--outline" id="cloud-rollback-btn" style="font-size:0.72rem; padding:4px 10px">
                ↩️ بازگردانی نسخه قبل
              </button>
            </div>`:""}
        </div>

        <!-- بخش مدیریت داده و بکاپ دستی (Export/Import) -->
        <div style="margin-top:var(--space-4); border-top:1px solid var(--border); pt-3; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding-top:12px">
          <span class="text-secondary" style="font-size:0.78rem">پشتیبان‌گیری دستی (فایل JSON آفلاین):</span>
          <div style="display:flex; gap:8px">
            <button type="button" class="btn btn--secondary" id="cloud-export-btn" style="font-size:0.75rem; padding:6px 14px">خروجی دستی</button>
            <input type="file" id="cloud-import-input" accept="application/json" style="display:none" />
            <button type="button" class="btn btn--secondary" id="cloud-import-btn" style="font-size:0.75rem; padding:6px 14px">ورودی دستی</button>
          </div>
        </div>
      </div>
    `}bindCardEvents(e,t){var s,a,c,o,u,b,_,y,p,E,v;var i=e||document;(s=i.querySelector("#cloud-connect-btn"))==null||s.addEventListener("click",async()=>{try{await this.service.connect(),t&&t()}catch(d){alert(I(d))}}),(a=i.querySelector("#cloud-reconnect-btn"))==null||a.addEventListener("click",async()=>{try{await this.service.connect(),t&&t()}catch(d){alert(I(d))}}),(c=i.querySelector("#cloud-check-remote-btn"))==null||c.addEventListener("click",()=>{this.service.reopenDecision()}),(o=i.querySelector("#cloud-backup-now-btn"))==null||o.addEventListener("click",async()=>{try{await this.service.performBackup(),alert("پشتیبان‌گیری در Google Drive انجام شد."),t&&t()}catch(d){alert(I(d))}}),(u=i.querySelector("#cloud-disconnect-btn"))==null||u.addEventListener("click",async()=>{if(confirm("اتصال به Google Drive قطع شود؟ پشتیبان‌گیری خودکار متوقف می‌شود.")){var d=confirm(`آیا نسخه‌های پشتیبان موجود در پوشه مخفی Google Drive هم حذف شوند؟
تأیید = حذف، لغو = نگه‌داشتن`);try{await this.service.disconnect(d),alert("اتصال با موفقیت قطع شد."),t&&t()}catch(l){alert(I(l))}}}),(b=i.querySelector("#cloud-enable-enc-btn"))==null||b.addEventListener("click",async()=>{var h,m;var d=((h=i.querySelector("#cloud-enc-pass"))==null?void 0:h.value)||"",l=((m=i.querySelector("#cloud-enc-pass-confirm"))==null?void 0:m.value)||"";if(d.length<k.minPassphraseLength){alert(`گذرواژه باید حداقل ${k.minPassphraseLength} نویسه باشد.`);return}if(d!==l){alert("گذرواژه و تکرار آن یکسان نیستند.");return}try{await this.service.enableEncryption(d),alert("رمزنگاری سمت کلاینت با موفقیت فعال شد."),t&&t()}catch(T){alert(I(T))}}),(_=i.querySelector("#cloud-disable-enc-btn"))==null||_.addEventListener("click",async()=>{if(confirm("از این پس نسخه‌های ابری بدون رمزنگاری ذخیره خواهند شد. آیا ادامه می‌دهید؟"))try{await this.service.disableEncryption(),alert("رمزنگاری غیرفعال شد."),t&&t()}catch(d){alert(I(d))}}),(y=i.querySelector("#cloud-notify-failures-check"))==null||y.addEventListener("change",d=>{this.service.setNotifyFailures(d.target.checked)}),(p=i.querySelector("#cloud-rollback-btn"))==null||p.addEventListener("click",async()=>{if(confirm("اطلاعات این دستگاه به وضعیت قبل از آخرین بازیابی بازمی‌گردد. ادامه می‌دهید؟"))try{await this.service.rollbackLastRestore(),alert("داده‌ها به وضعیت پیش از بازیابی برگشت."),window.location.reload()}catch(d){alert(I(d))}}),(E=i.querySelector("#cloud-export-btn"))==null||E.addEventListener("click",()=>{this.service.exportLocalJson()});var r=i.querySelector("#cloud-import-input");(v=i.querySelector("#cloud-import-btn"))==null||v.addEventListener("click",()=>{r==null||r.click()}),r==null||r.addEventListener("change",async d=>{var h;var l=(h=d.target.files)==null?void 0:h[0];if(l)try{await this.service.importLocalJson(l),alert("داده‌ها با موفقیت از فایل وارد شدند."),t&&t()}catch(m){alert("خطا در ورود داده: "+m.message)}d.target.value=""})}}var we=new bt,G,V,H;class kt{constructor(e){Y(this,G,0);Y(this,V,!1);Y(this,H,null);this.root=e}async _getNotificationState(){if(!J()||!("Notification"in window))return"unsupported";if(Notification.permission==="denied")return"denied";if(Notification.permission==="default")return"default";var e=await F.getActiveSubscription();return e?"active":"inactive"}async _getTelegramState(){if(!L.isConfigured())return"unconfigured";if(!L.isEnabled())return"disabled";var e=await L.getLinkStatus();return e.linked?{status:"linked",username:e.username}:{status:"pending"}}_notificationCardHTML(e){return e==="loading"?`
        <div class="card about-section" id="notif-card-slot">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:0">در حال بررسی وضعیت اعلان...</p>
        </div>`:e==="default"?`
        <div class="card about-section" id="notif-card-slot">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            برای دریافت یادآور حتی وقتی برنامه بسته است، اعلان را فعال کنید.
          </p>
          <button class="btn btn--primary btn--block" id="notif-permission-btn">فعال‌سازی اعلان</button>
        </div>`:e==="active"?`
        <div class="card about-section" id="notif-card-slot">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            ✓ اعلان فعال است — یادآورهای شما حتی وقتی برنامه بسته باشد ارسال می‌شوند.
          </p>
        </div>`:e==="inactive"?`
        <div class="card about-section" id="notif-card-slot">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            مجوز اعلان دارید ولی در حال حاضر غیرفعال است.
          </p>
          <button class="btn btn--primary btn--block" id="notif-reenable-btn">فعال‌سازی دوباره</button>
        </div>`:e==="denied"?`
        <div class="card about-section" id="notif-card-slot">
          <h3>یادآور پوش</h3>
          <p class="text-secondary" style="margin-bottom:12px">
            دسترسی اعلان قبلاً رد شده است. مرورگر اجازه نمی‌دهد دوباره از داخل
            اپ بپرسیم — باید دستی از تنظیمات فعالش کنید:
          </p>
          <p class="text-secondary" style="margin-bottom:12px; font-size:0.78rem">
            Chrome → روی آیکون قفل/اطلاعات کنار آدرس سایت بزنید → Permissions
            → Notifications → Allow. سپس این دکمه را بزنید.
          </p>
          <button class="btn btn--secondary btn--block" id="notif-recheck-btn">بررسی دوباره</button>
        </div>`:'<div class="card about-section" id="notif-card-slot"></div>'}_telegramCardHTML(e){if(e==="loading")return`
        <div class="card about-section" id="telegram-card-slot">
          <h3>یادآور تلگرام</h3>
          <p class="text-secondary" style="margin-bottom:0">در حال بررسی وضعیت اتصال...</p>
        </div>`;if(e==="unconfigured")return`
        <div class="card about-section" id="telegram-card-slot">
          <h3>یادآور تلگرام</h3>
          <p class="text-secondary" style="margin-bottom:0; font-size:0.8rem">
            این قابلیت هنوز روی سرور پیکربندی نشده است.
          </p>
        </div>`;if(e==="disabled")return`
        <div class="card about-section" id="telegram-card-slot">
          <h3>یادآور تلگرام</h3>
          <p class="text-secondary" style="margin-bottom:8px">
            علاوه بر اعلان مرورگر، یادآور وظایف را به‌صورت پیام در تلگرام هم
            دریافت کنید — حتی روی گوشی یا کامپیوتری که این اپ روی آن نصب نیست.
          </p>
          <p class="text-secondary" style="margin-bottom:12px; font-size:0.78rem">
            ربات تلگرام: <b dir="ltr">@${this._esc(R.botUsername)}</b>
          </p>
          <button class="btn btn--primary btn--block" id="telegram-link-btn">اتصال به تلگرام</button>
        </div>`;if(e.status==="pending"){var t=L.getDeepLink();return`
        <div class="card about-section" id="telegram-card-slot">
          <h3>یادآور تلگرام</h3>

          <p class="text-secondary" style="margin-bottom:6px">
            <b>مرحله ۱:</b> روی دکمه‌ی «باز کردن بات در تلگرام» بزنید، یا اگر
            روی همین دستگاه باز نشد، لینک یا نام‌کاربری زیر را کپی کرده و در
            اپلیکیشن تلگرام (روی موبایل یا دسکتاپ) جست‌وجو/باز کنید.
          </p>
          <p class="text-secondary" style="margin-bottom:6px">
            <b>مرحله ۲:</b> در صفحه‌ی بات، روی دکمه‌ی آبی‌رنگ <b>Start</b> بزنید
            (یا خودتان پیام <code dir="ltr">/start</code> را بفرستید). بات
            بلافاصله پیام «اتصال با موفقیت انجام شد» را برایتان می‌فرستد.
          </p>
          <p class="text-secondary" style="margin-bottom:16px">
            <b>مرحله ۳:</b> به همین صفحه برگردید و صبر کنید؛ وضعیت به‌صورت
            خودکار (بدون نیاز به رفرش) به «متصل» تغییر می‌کند.
          </p>

          <div class="field">
            <label class="field__label">نام‌کاربری بات</label>
            <div style="display:flex; gap:8px;">
              <input class="field__input" id="telegram-bot-username" type="text"
                     value="@${this._esc(R.botUsername)}" readonly style="flex:1; direction:ltr; text-align:left" />
              <button class="btn btn--secondary" id="telegram-copy-username-btn" type="button">کپی</button>
            </div>
          </div>

          <div class="field">
            <label class="field__label">لینک اتصال مستقیم</label>
            <div style="display:flex; gap:8px;">
              <input class="field__input" id="telegram-deep-link" type="text"
                     value="${this._esc(t)}" readonly style="flex:1; direction:ltr; text-align:left; font-size:0.75rem" />
              <button class="btn btn--secondary" id="telegram-copy-link-btn" type="button">کپی لینک</button>
            </div>
            <p class="field__hint">این لینک مخصوص همین دستگاه شماست؛ آن را برای کسی نفرستید.</p>
          </div>

          <a class="btn btn--primary btn--block" href="${this._esc(t)}"
             target="_blank" rel="noopener" id="telegram-open-bot-link">باز کردن بات در تلگرام</a>
          <button class="btn btn--outline btn--block" style="margin-top:10px" id="telegram-cancel-btn" type="button">انصراف</button>

          <p class="field__hint" style="margin-top:12px">
            داخل بات هم می‌توانید از دستورهای <code dir="ltr">/status</code>
            (وضعیت اتصال)، <code dir="ltr">/list</code> (یادآورهای در انتظار)
            و <code dir="ltr">/help</code> (راهنما) استفاده کنید.
          </p>
        </div>`}var i=e.username?`<code dir="ltr">@${this._esc(e.username)}</code>`:"بدون نام‌کاربری تلگرام";return`
      <div class="card about-section" id="telegram-card-slot">
        <h3>یادآور تلگرام</h3>
        <p class="text-secondary" style="margin-bottom:12px">
          ✓ اتصال برقرار است (${i}) — یادآورهای وظایف از این پس در
          تلگرام هم ارسال می‌شود.
        </p>
        <p class="field__hint" style="margin-bottom:12px">
          برای دیدن یادآورهای در انتظار، در بات دستور
          <code dir="ltr">/list</code> را بفرستید.
        </p>
        <button class="btn btn--danger btn--block" id="telegram-unlink-btn" type="button">قطع اتصال تلگرام</button>
      </div>`}_shellHTML(e,t,i,r){return`
      <div class="about-hero">
        <div class="about-avatar">MHK</div>
        <h2>محمدحسین کرمی</h2>
        <p class="text-secondary">توسعه‌دهنده نرم‌افزار</p>
        <div class="about-links">
          <a class="btn btn--outline" href="https://mhkarami97.ir" target="_blank" rel="noopener">وب‌سایت</a>
        </div>
      </div>

      ${t}

      ${i}

      ${r}

      <div class="card about-section">
        <h3>آمار کارها</h3>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-box__val stat-box__val--accent">${e.total}</div>
            <div class="stat-box__label">کل کارها</div>
          </div>
          <div class="stat-box">
            <div class="stat-box__val">${e.completed}</div>
            <div class="stat-box__label">انجام‌شده</div>
          </div>
          <div class="stat-box">
            <div class="stat-box__val stat-box__val--warning">${e.pending}</div>
            <div class="stat-box__label">در انتظار</div>
          </div>
          <div class="stat-box">
            <div class="stat-box__val stat-box__val--danger">${e.overdue}</div>
            <div class="stat-box__label">عقب‌افتاده</div>
          </div>
        </div>
      </div>

      <div class="card about-section">
        <h3>عیب‌یابی</h3>
        <p class="text-secondary" style="margin-bottom:12px">
          اگر اپ ظاهر قدیمی یا رفتار عجیب دارد (بعد از یک به‌روزرسانی)، این را بزنید.
        </p>
        <button class="btn btn--secondary btn--block" id="clear-cache-btn">پاک‌سازی کش و بارگذاری مجدد</button>
      </div>
    `}async render(){var e=++ue(this,G)._,t=D.getStats(),i=we.getCardHTML();this.root.innerHTML=this._shellHTML(t,this._notificationCardHTML("loading"),this._telegramCardHTML("loading"),i),this._bindStaticEvents(),we.bindCardEvents(this.root,()=>this.render());var r=await this._getNotificationState();if(e===P(this,G)){var s=this.root.querySelector("#notif-card-slot");s&&(s.outerHTML=this._notificationCardHTML(r),this._bindNotificationEvents());var a=await this._getTelegramState();if(e===P(this,G)){var c=this.root.querySelector("#telegram-card-slot");c&&(c.outerHTML=this._telegramCardHTML(a),this._bindTelegramEvents(a))}}}_bindStaticEvents(){var e;(e=document.getElementById("clear-cache-btn"))==null||e.addEventListener("click",t=>{this._runExclusive(t.currentTarget,"در حال پاک‌سازی...",async()=>{try{if("serviceWorker"in navigator){var i=await navigator.serviceWorker.getRegistrations();await Promise.all(i.map(s=>s.unregister()))}if("caches"in window){var r=await caches.keys();await Promise.all(r.map(s=>caches.delete(s)))}}finally{window.location.reload()}},{rerender:!1})})}_bindNotificationEvents(){var e,t,i,r;(e=document.getElementById("notif-permission-btn"))==null||e.addEventListener("click",s=>{this._runExclusive(s.currentTarget,"در حال درخواست مجوز...",()=>M.requestPermission())}),(t=document.getElementById("notif-reenable-btn"))==null||t.addEventListener("click",s=>{this._runExclusive(s.currentTarget,"در حال فعال‌سازی...",()=>F.enable())}),(i=document.getElementById("notif-disable-btn"))==null||i.addEventListener("click",s=>{this._runExclusive(s.currentTarget,"در حال غیرفعال‌سازی...",()=>F.disableAll())}),(r=document.getElementById("notif-recheck-btn"))==null||r.addEventListener("click",s=>{this._runExclusive(s.currentTarget,"در حال بررسی...",()=>Promise.resolve())})}_bindTelegramEvents(e){var r,s,a;(r=document.getElementById("telegram-link-btn"))==null||r.addEventListener("click",()=>{L.getOrCreateLinkCode(),L.setEnabled(!0),this.render()}),(s=document.getElementById("telegram-cancel-btn"))==null||s.addEventListener("click",()=>{L.setEnabled(!1),this._stopTelegramPolling(),this.render()}),(a=document.getElementById("telegram-unlink-btn"))==null||a.addEventListener("click",c=>{this._runExclusive(c.currentTarget,"در حال قطع اتصال...",()=>L.unlink())});var t=document.getElementById("telegram-copy-link-btn");t==null||t.addEventListener("click",()=>{var c=document.getElementById("telegram-deep-link");this._copyToClipboard((c==null?void 0:c.value)??""),this._flashCopied(t)});var i=document.getElementById("telegram-copy-username-btn");i==null||i.addEventListener("click",()=>{var c=document.getElementById("telegram-bot-username");this._copyToClipboard((c==null?void 0:c.value)??""),this._flashCopied(i)}),typeof e=="object"&&(e==null?void 0:e.status)==="pending"?this._startTelegramPolling():this._stopTelegramPolling()}_startTelegramPolling(){P(this,H)||K(this,H,setInterval(async()=>{var e=await L.getLinkStatus();e.linked&&(this._stopTelegramPolling(),this.render())},3e3))}_stopTelegramPolling(){P(this,H)&&(clearInterval(P(this,H)),K(this,H,null))}async _copyToClipboard(e){var i;if(!e)return!1;try{if((i=navigator.clipboard)!=null&&i.writeText)return await navigator.clipboard.writeText(e),!0}catch(r){console.error("[AboutView] clipboard API failed, falling back",r)}try{var t=document.createElement("textarea");return t.value=e,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.focus(),t.select(),document.execCommand("copy"),document.body.removeChild(t),!0}catch(r){return console.error("[AboutView] fallback copy failed",r),!1}}_flashCopied(e){if(e){var t=e.textContent;e.textContent="کپی شد!",e.disabled=!0,setTimeout(()=>{e.textContent=t,e.disabled=!1},1500)}}_esc(e){var t=document.createElement("div");return t.textContent=e??"",t.innerHTML}async _runExclusive(e,t,i,{rerender:r=!0}={}){if(!(P(this,V)||!e||e.disabled)){K(this,V,!0);var s=e.textContent;e.disabled=!0,e.textContent=t;try{await i()}catch(a){console.error("[AboutView] action failed:",a)}finally{K(this,V,!1),r?await this.render():(e.disabled=!1,e.textContent=s)}}}}G=new WeakMap,V=new WeakMap,H=new WeakMap;const{JalaliDate:A}=le,_t='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>',St='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',Ee='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',wt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',Et='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/></svg>',Dt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="4 15 8 9 12 13 18 5 20 7 12 17 8 13 4 19"/></svg>',Ct='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',It='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',Tt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>',De='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',At='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',xt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';class Lt{constructor(e){this.overlay=e,this.overlay.addEventListener("click",t=>{t.target===this.overlay&&this.close()})}close(){this.overlay.classList.remove("active"),setTimeout(()=>this.overlay.innerHTML="",250)}openTaskForm(e=null,t="default"){var y;const i=e?D.taskRepository.getById(e):null,r=D.getAllLists(),s=i!=null&&i.dueDateISO?A.fromISO(i.dueDateISO):null,a=[{key:"high",label:"بالا"},{key:"medium",label:"متوسط"},{key:"low",label:"پایین"}],c=[{key:"none",label:"بدون تکرار"},{key:"daily",label:"روزانه"},{key:"weekly",label:"هفتگی"},{key:"monthly",label:"ماهانه"}],o=[{key:"",label:"بدون یادآوری"},{key:"10",label:"۱۰ دقیقه قبل"},{key:"30",label:"۳۰ دقیقه قبل"},{key:"60",label:"۱ ساعت قبل"},{key:"1440",label:"۱ روز قبل"}],u=(i==null?void 0:i.priority)||"medium",b=(i==null?void 0:i.repeat)||"none",_=(i==null?void 0:i.reminderMinutesBefore)!=null?String(i.reminderMinutesBefore):"";this.overlay.innerHTML=`
      <div class="bottom-sheet">
        <div class="bottom-sheet__handle"></div>
        <div class="bottom-sheet__header">
          <h3>${i?"ویرایش کار":"کار جدید"}</h3>
          <button class="btn--icon" id="sheet-close" aria-label="بستن" title="بستن">${De}</button>
        </div>

        <div class="field">
          <label class="field__label">${_t}عنوان</label>
          <input class="field__input" id="f-title" value="${i?this._esc(i.title):""}" placeholder="مثلاً: خرید نان" autofocus />
        </div>

        <div class="field">
          <label class="field__label">${St}یادداشت</label>
          <textarea class="field__textarea" id="f-notes" placeholder="جزئیات بیشتر (اختیاری)">${i?this._esc(i.notes):""}</textarea>
        </div>

        <div class="field">
          <label class="field__label">${Ee}لیست</label>
          <div class="select-wrapper">
            <select class="field__select" id="f-list">
              ${r.map(p=>`<option value="${p.id}" ${p.id===((i==null?void 0:i.listId)||t)?"selected":""}>${p.name}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="field-row field">
          <div class="date-field">
            <label class="field__label">${wt}تاریخ (شمسی)</label>
            <button type="button" class="field__input date-field__trigger" id="f-date-trigger">
              <span id="f-date-display">${s?s.formatLong():"انتخاب تاریخ"}</span>
            </button>
            <input type="hidden" id="f-date" value="${s?s.format():""}" />
          </div>
          <div>
            <label class="field__label">${Et}ساعت</label>
            <input class="field__input" type="time" id="f-time" value="${(i==null?void 0:i.dueTime)||""}" />
          </div>
        </div>

        <div class="field__divider"></div>

        <div class="field">
          <label class="field__label">${Dt}اولویت</label>
          <div class="segmented" id="f-priority-group">
            ${a.map(p=>`
              <button type="button" class="segmented__option ${p.key===u?"active":""}" data-priority="${p.key}">
                <span class="priority-dot priority-dot--${p.key}"></span>${p.label}
              </button>`).join("")}
          </div>
          <input type="hidden" id="f-priority" value="${u}" />
        </div>

        <div class="field">
          <label class="field__label">${Ct}تکرار</label>
          <div class="toggle-group" id="f-repeat-group">
            ${c.map(p=>`<button type="button" class="toggle-group__option ${p.key===b?"active":""}" data-repeat="${p.key}">${p.label}</button>`).join("")}
          </div>
          <input type="hidden" id="f-repeat" value="${b}" />
        </div>

        <div class="field">
          <label class="field__label">${It}یادآوری</label>
          <div class="toggle-group" id="f-reminder-group">
            ${o.map(p=>`<button type="button" class="toggle-group__option ${p.key===_?"active":""}" data-reminder="${p.key}">${p.label}</button>`).join("")}
          </div>
          <input type="hidden" id="f-reminder" value="${_}" />
        </div>

        <div class="field__divider"></div>

        <button class="btn btn--primary btn--block" id="f-save">${i?"ذخیره تغییرات":"افزودن کار"}</button>
        ${i?'<button class="btn btn--danger btn--block" id="f-delete" style="margin-top:10px;">حذف کار</button>':""}
      </div>`,this.overlay.classList.add("active"),this._bindSegmented("f-priority-group","f-priority","priority"),this._bindSegmented("f-repeat-group","f-repeat","repeat"),this._bindSegmented("f-reminder-group","f-reminder","reminder"),this._pickerViewDate=s||A.today(),this._pickerSelectedDate=s,this._bindDatePicker(),this.overlay.querySelector("#sheet-close").addEventListener("click",()=>this.close()),this.overlay.querySelector("#f-save").addEventListener("click",()=>this._saveTask(i)),(y=this.overlay.querySelector("#f-delete"))==null||y.addEventListener("click",()=>{D.deleteTask(i.id),this.close()})}_bindDatePicker(){const e=this.overlay.querySelector("#f-date-trigger");e==null||e.addEventListener("click",t=>{t.stopPropagation(),this._toggleDatePicker()})}_toggleDatePicker(){const e=this.overlay.querySelector("#date-picker-popover");if(e){e.remove();return}const t=this.overlay.querySelector(".date-field"),i=document.createElement("div");i.id="date-picker-popover",i.className="date-picker-popover",i.innerHTML=this._renderDatePickerBody(),t.appendChild(i),this._bindDatePickerBody(i);const r=s=>{!i.contains(s.target)&&s.target.id!=="f-date-trigger"&&(i.remove(),document.removeEventListener("click",r))};setTimeout(()=>document.addEventListener("click",r),0)}_renderDatePickerBody(){const{jy:e,jm:t}=this._pickerViewDate,i=A.monthLength(e,t),s=new A(e,t,1).weekdayIndex,a=[];for(let o=0;o<s;o+=1)a.push(null);for(let o=1;o<=i;o+=1)a.push(new A(e,t,o));for(;a.length%7!==0;)a.push(null);const c=A.weekdayShort();return`
      <div class="date-picker-header">
        <button type="button" class="btn--icon" id="dp-prev" aria-label="ماه قبل">${At}</button>
        <span>${this._pickerViewDate.monthName} ${e}</span>
        <button type="button" class="btn--icon" id="dp-next" aria-label="ماه بعد">${xt}</button>
      </div>
      <div class="date-picker-grid">
        ${c.map(o=>`<div class="date-picker-grid__weekday">${o}</div>`).join("")}
        ${a.map(o=>{if(!o)return'<div class="date-picker-day is-empty"></div>';const u=this._pickerSelectedDate&&o.isSameDay(this._pickerSelectedDate),b=o.isToday();return`<div class="date-picker-day ${u?"selected":""} ${b?"today":""}" data-jy="${o.jy}" data-jm="${o.jm}" data-jd="${o.jd}">${o.jd}</div>`}).join("")}
      </div>
      <div class="date-picker-footer">
        <button type="button" class="btn btn--secondary" id="dp-clear">حذف تاریخ</button>
        <button type="button" class="btn btn--primary" id="dp-today">امروز</button>
      </div>`}_bindDatePickerBody(e){e.querySelector("#dp-prev").addEventListener("click",t=>{t.stopPropagation();const{jy:i,jm:r}=this._pickerViewDate;this._pickerViewDate=r===1?new A(i-1,12,1):new A(i,r-1,1),e.innerHTML=this._renderDatePickerBody(),this._bindDatePickerBody(e)}),e.querySelector("#dp-next").addEventListener("click",t=>{t.stopPropagation();const{jy:i,jm:r}=this._pickerViewDate;this._pickerViewDate=r===12?new A(i+1,1,1):new A(i,r+1,1),e.innerHTML=this._renderDatePickerBody(),this._bindDatePickerBody(e)}),e.querySelectorAll(".date-picker-day[data-jy]").forEach(t=>{t.addEventListener("click",i=>{i.stopPropagation();const r=new A(Number(t.dataset.jy),Number(t.dataset.jm),Number(t.dataset.jd));this._pickerSelectedDate=r,this.overlay.querySelector("#f-date").value=r.format(),this.overlay.querySelector("#f-date-display").textContent=r.formatLong(),e.remove()})}),e.querySelector("#dp-today").addEventListener("click",t=>{t.stopPropagation();const i=A.today();this._pickerSelectedDate=i,this.overlay.querySelector("#f-date").value=i.format(),this.overlay.querySelector("#f-date-display").textContent=i.formatLong(),e.remove()}),e.querySelector("#dp-clear").addEventListener("click",t=>{t.stopPropagation(),this._pickerSelectedDate=null,this.overlay.querySelector("#f-date").value="",this.overlay.querySelector("#f-date-display").textContent="انتخاب تاریخ",e.remove()})}_bindSegmented(e,t,i){const r=this.overlay.querySelector(`#${e}`),s=this.overlay.querySelector(`#${t}`);!r||!s||r.querySelectorAll("button").forEach(a=>{a.addEventListener("click",()=>{r.querySelectorAll("button").forEach(c=>c.classList.remove("active")),a.classList.add("active"),s.value=a.dataset[i]})})}_saveTask(e){const t=this.overlay.querySelector("#f-title").value.trim();if(!t)return;const i=this.overlay.querySelector("#f-notes").value,r=this.overlay.querySelector("#f-list").value,s=this.overlay.querySelector("#f-date").value.trim(),a=this.overlay.querySelector("#f-time").value||null,c=this.overlay.querySelector("#f-priority").value,o=this.overlay.querySelector("#f-repeat").value,u=this.overlay.querySelector("#f-reminder").value,b=u?Number(u):null;let _=null;if(s){const p=s.split("/").map(E=>Number(E.trim()));p.length===3&&!p.some(Number.isNaN)&&(_=new A(p[0],p[1],p[2]).toISOStringSafe())}const y={title:t,notes:i,listId:r,dueDateISO:_,dueTime:a,priority:c,repeat:o,reminderMinutesBefore:b};e?D.updateTask(e.id,y):D.createTask(y),this.close()}openListForm(){this.overlay.innerHTML=`
      <div class="bottom-sheet">
        <div class="bottom-sheet__handle"></div>
        <div class="bottom-sheet__header">
          <h3>لیست جدید</h3>
          <button class="btn--icon" id="sheet-close" aria-label="بستن" title="بستن">${De}</button>
        </div>
        <div class="field">
          <label class="field__label">${Ee}نام لیست</label>
          <input class="field__input" id="list-name" placeholder="مثلاً: کار، خانه، تحصیل" autofocus />
        </div>
        <div class="field">
          <label class="field__label">${Tt}رنگ</label>
          <input class="field__input" type="color" id="list-color" value="#1ed760" style="height:48px;padding:4px;cursor:pointer;" />
        </div>
        <button class="btn btn--primary btn--block" id="list-save">افزودن لیست</button>
      </div>`,this.overlay.classList.add("active"),this.overlay.querySelector("#sheet-close").addEventListener("click",()=>this.close()),this.overlay.querySelector("#list-save").addEventListener("click",()=>{const e=this.overlay.querySelector("#list-name").value.trim(),t=this.overlay.querySelector("#list-color").value;e&&(D.createList(e,t),this.close())})}_esc(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}}const se="theme";class Nt{constructor(){this.current=$.get(se,(this._prefersDark(),"dark")),this._apply()}_prefersDark(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches}_apply(){document.documentElement.setAttribute("data-theme",this.current),document.body&&document.body.setAttribute("data-theme",this.current);const e=document.querySelector('meta[name="theme-color"]');e&&e.setAttribute("content",this.current==="dark"?"#0f172a":"#f8fafc")}toggle(){this.current=this.current==="dark"?"light":"dark",$.set(se,this.current),this._apply(),S.emit(w.THEME_CHANGED,this.current)}set(e){this.current=e,$.set(se,e),this._apply(),S.emit(w.THEME_CHANGED,this.current)}}const Ot=new Nt;class Rt{constructor(){this.deferredPrompt=null,this.newWorker=null,this.installPromptDismissed=localStorage.getItem("installPromptDismissed"),this._bindInstallEvents(),this._initServiceWorker()}_bindInstallEvents(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),this.deferredPrompt=e,this.installPromptDismissed||this._showInstallPromptUI()}),window.addEventListener("appinstalled",()=>{console.log("App installed successfully"),this.deferredPrompt=null})}_showInstallPromptUI(){const e=document.createElement("div");e.className="install-prompt",e.innerHTML=`
      <div class="install-prompt-text">
        <div class="install-prompt-title">نصب اپلیکیشن</div>
        <div class="install-prompt-desc">برای دسترسی سریع‌تر، اپ را نصب کنید</div>
      </div>
      <button class="install-btn" id="installBtn">نصب</button>
      <button class="close-install" id="closeInstall">✕</button>
    `,document.body.appendChild(e),document.getElementById("installBtn").addEventListener("click",async()=>{if(!this.deferredPrompt)return;this.deferredPrompt.prompt(),await this.deferredPrompt.userChoice==="accepted"&&console.log("User accepted the install prompt"),this.deferredPrompt=null,e.remove()}),document.getElementById("closeInstall").addEventListener("click",()=>{localStorage.setItem("installPromptDismissed","true"),e.remove()})}_initServiceWorker(){if(!("serviceWorker"in navigator))return;window.addEventListener("load",async()=>{try{const t=await navigator.serviceWorker.register("sw.js");t.waiting&&(this._showUpdateNotification(),this.newWorker=t.waiting),t.addEventListener("updatefound",()=>{this.newWorker=t.installing,this.newWorker.addEventListener("statechange",()=>{this.newWorker.state==="installed"&&navigator.serviceWorker.controller&&this._showUpdateNotification()})})}catch(t){console.error("SW registration failed:",t)}}),navigator.serviceWorker.addEventListener("message",t=>{var i;((i=t.data)==null?void 0:i.type)==="SW_UPDATED"&&this._showUpdateNotification()});let e=!1;navigator.serviceWorker.addEventListener("controllerchange",()=>{e||(e=!0,window.location.reload())})}_showUpdateNotification(){const e=document.getElementById("updateNotification");if(!e)return;e.classList.add("show");const t=document.getElementById("updateButton"),i=document.getElementById("dismissUpdate");t==null||t.addEventListener("click",()=>{this.newWorker?this.newWorker.postMessage({type:"SKIP_WAITING"}):window.location.reload()}),i==null||i.addEventListener("click",()=>{e.classList.remove("show")})}}class $t{constructor(){this.viewsContainer=document.getElementById("view-container"),this.overlay=document.getElementById("sheet-overlay"),this.sheet=new Lt(this.overlay),this.pwaManager=new Rt,this.views={tasks:new Ye(this._createViewEl("view-tasks"),this.sheet),calendar:new et(this._createViewEl("view-calendar")),about:new kt(this._createViewEl("view-about"))},this.router=new Oe,this._registerRoutes(),this._bindGlobalUI()}_createViewEl(e){const t=document.createElement("div");return t.className="view",t.id=e,this.viewsContainer.appendChild(t),t}_registerRoutes(){this.router.register("tasks",()=>this._activate("view-tasks",()=>this.views.tasks.render())).register("calendar",()=>this._activate("view-calendar",()=>this.views.calendar.render())).register("about",()=>this._activate("view-about",()=>this.views.about.render()))}_activate(e,t){document.querySelectorAll(".view").forEach(i=>i.classList.remove("active")),document.getElementById(e).classList.add("active"),t(),document.querySelectorAll(".bottom-nav__item[data-route]").forEach(i=>{i.classList.toggle("active",i.dataset.route===e.replace("view-",""))})}_bindGlobalUI(){var e,t;document.querySelectorAll(".bottom-nav__item[data-route]").forEach(i=>{i.addEventListener("click",()=>this.router.navigate(i.dataset.route))}),(e=document.getElementById("fab-add"))==null||e.addEventListener("click",()=>this.sheet.openTaskForm()),(t=document.getElementById("fab-add-list"))==null||t.addEventListener("click",()=>this.sheet.openListForm()),["theme-toggle-mobile","theme-toggle-desktop"].forEach(i=>{var r;(r=document.getElementById(i))==null||r.addEventListener("click",()=>Ot.toggle())})}start(){this.router.start("tasks"),Ae.start()}}document.addEventListener("DOMContentLoaded",()=>{const n=new $t;n.start(),window.app=n});
