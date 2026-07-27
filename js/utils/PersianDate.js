/**
 * PersianDate — self-contained Jalali (Solar Hijri) calendar utility.
 * Conversion algorithm ported from jalaali-js (MIT License):
 * https://github.com/jalaali/jalaali-js
 * Accurate for years 1 to 3177 AP using the 33-year break-point table.
 */
const PersianDate = (() => {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];

  const div = (a, b) => ~~(a / b);
  const mod = (a, b) => a - ~~(a / b) * b;

  function jalCal(jy) {
    const bl = breaks.length;
    let jp = breaks[0];
    if (jy < jp || jy >= breaks[bl - 1]) {
      throw new Error("Invalid Jalali year " + jy);
    }
    let leapJ = -14;
    let jump = 0;
    let i = 1;
    for (; i < bl; i += 1) {
      const jm = breaks[i];
      jump = jm - jp;
      if (jy < jm) break;
      leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }
    let n = jy - jp;
    leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    const gy = jy + 621;
    const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    const march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    let leap = mod(mod(n + 1, 33) - 1, 33);
    if (leap === -1) leap = 32;
    return { leap, march };
  }

  function g2d(gy, gm, gd) {
    let d =
      div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
      div(153 * mod(gm + 9, 12) + 2, 5) +
      gd -
      34840408;
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
  }

  function d2g(jdn) {
    let j = 4 * jdn + 139361631;
    j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = div(mod(j, 1461), 4) * 5 + 308;
    const gd = div(mod(i, 153), 5) + 1;
    const gm = mod(div(i, 153), 12) + 1;
    const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return { gy, gm, gd };
  }

  function j2d(jy, jm, jd) {
    const r = jalCal(jy);
    return g2d(jy + 621, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
  }

  function d2j(jdn) {
    const gy = d2g(jdn).gy;
    let jy = gy - 621;
    let r = jalCal(jy);
    let jdn1f = g2d(gy, 3, r.march);
    let jd;
    let jm;
    const diff = jdn - jdn1f;
    if (diff >= 0) {
      if (diff <= 185) {
        jm = 1 + div(diff, 31);
        jd = mod(diff, 31) + 1;
        return { jy, jm, jd };
      }
      jy += 1;
    } else {
      jy -= 1;
      r = jalCal(jy);
      jdn1f = g2d(gy - 1, 3, r.march);
    }
    const k = jdn - jdn1f - 186;
    jm = 7 + div(k, 30);
    jd = mod(k, 30) + 1;
    return { jy, jm, jd };
  }

  function toJalali(gy, gm, gd) {
    const { jy, jm, jd } = d2j(g2d(gy, gm, gd));
    return { jy, jm, jd };
  }

  function toGregorian(jy, jm, jd) {
    const { gy, gm, gd } = d2g(j2d(jy, jm, jd));
    return { gy, gm, gd };
  }

  function isLeapJalaliYear(jy) {
    return jalCal(jy).leap === 0;
  }

  function jalaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaliYear(jy) ? 30 : 29;
  }

  const MONTH_NAMES = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
  ];
  const WEEKDAY_NAMES = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
  const WEEKDAY_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  class JalaliDate {
    constructor(jy, jm, jd) {
      this.jy = jy;
      this.jm = jm;
      this.jd = jd;
    }

    static fromDate(date) {
      const { jy, jm, jd } = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
      return new JalaliDate(jy, jm, jd);
    }

    static today() {
      return JalaliDate.fromDate(new Date());
    }

    static fromISO(isoString) {
      if (!isoString) return null;
      const d = new Date(isoString);
      return JalaliDate.fromDate(d);
    }

    toDate() {
      const { gy, gm, gd } = toGregorian(this.jy, this.jm, this.jd);
      return new Date(gy, gm - 1, gd);
    }

    toISODate() {
      const d = this.toDate();
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    get monthName() {
      return MONTH_NAMES[this.jm - 1];
    }

    get weekdayIndex() {
      const dow = this.toDate().getDay();
      return (dow + 1) % 7;
    }

    get weekdayName() {
      return WEEKDAY_NAMES[this.weekdayIndex];
    }

    format(pattern = "YYYY/MM/DD") {
      const pad = (n) => String(n).padStart(2, "0");
      return pattern
        .replace("YYYY", this.jy)
        .replace("MM", pad(this.jm))
        .replace("DD", pad(this.jd));
    }

    formatLong() {
      return `${this.weekdayName} ${this.jd} ${this.monthName} ${this.jy}`;
    }

    isSameDay(other) {
      return !!other && this.jy === other.jy && this.jm === other.jm && this.jd === other.jd;
    }

    isToday() {
      return this.isSameDay(JalaliDate.today());
    }

    addDays(n) {
      const d = this.toDate();
      d.setDate(d.getDate() + n);
      return JalaliDate.fromDate(d);
    }

    static monthNames() {
      return MONTH_NAMES;
    }

    static weekdayShort() {
      return WEEKDAY_SHORT;
    }

    static monthLength(jy, jm) {
      return jalaliMonthLength(jy, jm);
    }

    static isLeapYear(jy) {
      return isLeapJalaliYear(jy);
    }
  }

  return { JalaliDate };
})();

export default PersianDate;
