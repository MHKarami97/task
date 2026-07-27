# یادآور کارها (Persian Task Reminder PWA)

اپلیکیشن مدیریت و یادآوری کارها، مشابه Google Tasks، **کاملاً سمت کاربر (Client-Only)** و بدون هیچ بک‌اند یا سرور.
تمام داده‌ها در `localStorage` مرورگر شما ذخیره می‌شود. قابل هاست روی GitHub Pages.

## ویژگی‌ها

- ✅ افزودن، ویرایش، حذف، تیک‌زدن و ستاره‌دار کردن کارها
- ✅ لیست‌های چندگانه (مثل "کار"، "شخصی") با رنگ دلخواه
- ✅ زیرکار (Subtasks) برای هر کار
- ✅ اولویت (بالا/متوسط/پایین) با نشانگر رنگی
- ✅ تکرار کار (روزانه/هفتگی/ماهانه) — با تولید خودکار کار بعدی پس از تکمیل
- ✅ **تقویم شمسی (جلالی) کامل** — پیاده‌سازی مستقل بدون کتابخانه خارجی، بر اساس الگوریتم jalaali-js
- ✅ گروه‌بندی خودکار کارها (عقب‌افتاده / امروز / فردا / این هفته / بعداً)
- ✅ یادآوری با Web Notifications API (بدون نیاز به سرور Push)
- ✅ حالت تیره / روشن با ذخیره ترجیح کاربر
- ✅ طراحی کاملاً موبایل‌فرندلی با نویگیشن پایین صفحه (Bottom Navigation)، در دسکتاپ به Sidebar تبدیل می‌شود
- ✅ PWA کامل: قابل نصب (Add to Home Screen)، آفلاین با Service Worker، مانیفست کامل
- ✅ صفحه «درباره ما» با معرفی توسعه‌دهنده و لینک به mhkarami97.ir
- ✅ راست‌به‌چپ (RTL) کامل و فونت فارسی Vazirmatn

## معماری و الگوهای طراحی (Design Patterns)

پروژه با معماری لایه‌ای (Layered) و اصول SOLID نوشته شده است:

| لایه | مسئولیت | الگو |
|---|---|---|
| `models/` | موجودیت‌های Domain (`Task`, `TaskList`) | Rich Domain Model |
| `repositories/` | ماندگاری داده در localStorage | Repository + Adapter |
| `services/` | منطق‌های عمومی (تم، اعلان، مرتب‌سازی) | Singleton, Strategy, Observer |
| `controllers/` | هماهنگی بین لایه‌ها | Facade |
| `views/` | رندر DOM و رویدادها | Observer (subscribe به EventBus) |
| `router.js` | مسیریابی مبتنی بر hash | — |

## ساختار پوشه‌ها

```
persian-tasks-pwa/
├── index.html
├── manifest.json
├── service-worker.js
├── css/
│   ├── variables.css      # توکن‌های طراحی (رنگ، فاصله، شعاع)
│   ├── base.css           # ریست و استایل پایه
│   ├── layout.css         # چیدمان صفحه و نویگیشن
│   ├── components.css     # کارت، دکمه، ورودی، مودال
│   └── responsive.css     # breakpoint ها
├── js/
│   ├── app.js             # نقطه شروع و Composition Root
│   ├── router.js
│   ├── utils/
│   │   ├── PersianDate.js # تقویم جلالی (بدون کتابخانه خارجی)
│   │   └── idGenerator.js
│   ├── models/
│   │   ├── Task.js
│   │   └── TaskList.js
│   ├── repositories/
│   │   ├── StorageAdapter.js
│   │   ├── TaskRepository.js
│   │   └── ListRepository.js
│   ├── services/
│   │   ├── EventBus.js
│   │   ├── ThemeManager.js
│   │   ├── SortStrategy.js
│   │   └── NotificationService.js
│   ├── controllers/
│   │   ├── TaskController.js
│   │   └── SheetController.js
│   └── views/
│       ├── TasksView.js
│       ├── CalendarView.js
│       └── AboutView.js
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## نحوه اجرا (لوکال)

از آنجا که ماژول‌های ES و Service Worker نیاز به پروتکل http دارند، فایل `index.html` را مستقیم باز نکنید. یک سرور ساده اجرا کنید:

```bash
# با Node.js
npx serve .

# یا با Python
python -m http.server 8080
```

سپس آدرس `http://localhost:8080` را باز کنید.

## هاست روی GitHub Pages

1. محتوای این پوشه را در یک ریپازیتوری گیت‌هاب push کنید.
2. در تنظیمات ریپازیتوری، بخش **Settings → Pages** را باز کنید.
3. Source را روی شاخه `main` و پوشه `/ (root)` قرار دهید.
4. بعد از چند دقیقه، سایت روی آدرس `https://<username>.github.io/<repo-name>/` در دسترس خواهد بود.

> نکته: چون مسیرها به‌صورت نسبی (`./`) نوشته شده‌اند، پروژه هم روی ریشه دامنه و هم زیرپوشه‌ی گیت‌هاب پیجز به‌درستی کار می‌کند.

## نصب به‌عنوان اپلیکیشن (PWA)

در مرورگرهای مبتنی بر Chromium (اندروید/دسکتاپ)، پس از باز کردن سایت گزینه «Add to Home Screen» یا آیکن نصب در نوار آدرس ظاهر می‌شود. در iOS Safari از منوی Share گزینه «Add to Home Screen» را انتخاب کنید.

## تقویم جلالی

تبدیل تاریخ میلادی↔شمسی به‌صورت کامل و بدون کتابخانه خارجی در `js/utils/PersianDate.js` پیاده‌سازی شده، بر اساس الگوریتم منتشرشده در [jalaali-js](https://github.com/jalaali/jalaali-js) (دقیق برای سال‌های ۱ تا ۳۱۷۷ هجری شمسی).

## محدودیت‌های شناخته‌شده

- یادآوری‌ها (Notifications) فقط زمانی کار می‌کنند که تب/اپلیکیشن باز باشد یا Service Worker در پس‌زمینه فعال باشد؛ برای یادآوری‌های واقعاً پس‌زمینه‌ای در iOS محدودیت‌های سیستم‌عامل وجود دارد.
- داده‌ها فقط در همان مرورگر/دستگاه ذخیره می‌شوند و بین دستگاه‌ها همگام‌سازی نمی‌شوند (چون بک‌اند وجود ندارد).

## توسعه‌دهنده

**محمدحسین کرمی** — mhkarami97.ir
