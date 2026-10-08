/**
 * PersianDate - self-contained Jalali (Solar Hijri) calendar utility.
 * Conversion algorithm ported from jalaali-js (MIT): https://github.com/jalaali/jalaali-js
 * Valid for Jalali years -61..3177.
 */
const PersianDate = (() => {
  const BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const MONTH_NAMES = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  const WEEKDAY_NAMES = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  const WEEKDAY_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  const div = (a, b) => ~~(a / b);
  const mod = (a, b) => a - ~~(a / b) * b;

  function jalCal(jy) {
    var bl = BREAKS.length;
    var gy = jy + 621;
    var leapJ = -14;
    var jp = BREAKS[0];
    var jump = 0;
    var jm;
    var n;
    var i;

    if (jy < jp || jy >= BREAKS[bl - 1]) {
      throw new Error('Invalid Jalali year ' + jy);
    }

    for (i = 1; i < bl; i += 1) {
      jm = BREAKS[i];
      jump = jm - jp;
      if (jy < jm) break;
      leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }

    n = jy - jp;
    leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

    var leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    var march = 20 + leapJ - leapG;

    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    var leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;

    return { leap: leap, gy: gy, march: march };
  }

  function g2d(gy, gm, gd) {
    var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
      + div(153 * mod(gm + 9, 12) + 2, 5)
      + gd - 34840408;
    return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  }

  function d2g(jdn) {
    var j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    var i = div(mod(j, 1461), 4) * 5 + 308;
    var gd = div(mod(i, 153), 5) + 1;
    var gm = mod(div(i, 153), 12) + 1;
    var gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return { gy: gy, gm: gm, gd: gd };
  }

  function j2d(jy, jm, jd) {
    var r = jalCal(jy);
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
  }

  function d2j(jdn) {
    var gy = d2g(jdn).gy;
    var jy = gy - 621;
    var r = jalCal(jy);
    var jdn1f = g2d(gy, 3, r.march);
    var diff = jdn - jdn1f;
    var k;

    if (diff >= 0) {
      if (diff <= 185) {
        return { jy: jy, jm: 1 + div(diff, 31), jd: mod(diff, 31) + 1 };
      }
      k = diff - 186;
    } else {
      jy -= 1;
      r = jalCal(jy);
      jdn1f = g2d(gy - 1, 3, r.march);
      k = jdn - jdn1f - 186;
    }

    return { jy: jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
  }

  function toJalali(gy, gm, gd) {
    return d2j(g2d(gy, gm, gd));
  }

  function toGregorian(jy, jm, jd) {
    return d2g(j2d(jy, jm, jd));
  }

  function isLeapJalaliYear(jy) {
    return jalCal(jy).leap === 0;
  }

  function jalaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaliYear(jy) ? 30 : 29;
  }

  class JalaliDate {
    constructor(jy, jm, jd) {
      this.jy = jy;
      this.jm = jm;
      this.jd = jd;
    }

    static fromDate(date) {
      var j = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
      return new JalaliDate(j.jy, j.jm, j.jd);
    }

    static today() {
      return JalaliDate.fromDate(new Date());
    }

    static fromISO(isoString) {
      if (!isoString) return null;
      return JalaliDate.fromDate(new Date(isoString));
    }

    toDate() {
      var g = toGregorian(this.jy, this.jm, this.jd);
      return new Date(g.gy, g.gm - 1, g.gd);
    }

    toISODate() {
      var d = this.toDate();
      var pad = (n) => String(n).padStart(2, '0');
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    toISOStringSafe() {
      var g = toGregorian(this.jy, this.jm, this.jd);
      return new Date(Date.UTC(g.gy, g.gm - 1, g.gd, 12, 0, 0)).toISOString();
    }

    get monthName() {
      return MONTH_NAMES[this.jm - 1];
    }

    get weekdayIndex() {
      return (this.toDate().getDay() + 1) % 7;
    }

    get weekdayName() {
      return WEEKDAY_NAMES[this.weekdayIndex];
    }

    format(pattern) {
      var pad = (n) => String(n).padStart(2, '0');
      return (pattern || 'YYYY/MM/DD')
        .replace('YYYY', this.jy)
        .replace('MM', pad(this.jm))
        .replace('DD', pad(this.jd));
    }

    formatLong() {
      return this.weekdayName + ' ' + this.jd + ' ' + this.monthName + ' ' + this.jy;
    }

    isSameDay(other) {
      return !!other && this.jy === other.jy && this.jm === other.jm && this.jd === other.jd;
    }

    isToday() {
      return this.isSameDay(JalaliDate.today());
    }

    addDays(n) {
      var d = this.toDate();
      d.setDate(d.getDate() + n);
      return JalaliDate.fromDate(d);
    }

    static monthNames() { return MONTH_NAMES; }
    static weekdayShort() { return WEEKDAY_SHORT; }
    static monthLength(jy, jm) { return jalaliMonthLength(jy, jm); }
    static isLeapYear(jy) { return isLeapJalaliYear(jy); }

    static get JalaliDate() { return JalaliDate; }
    static toJalali(gy, gm, gd) { return toJalali(gy, gm, gd); }
    static toGregorian(jy, jm, jd) { return toGregorian(jy, jm, jd); }
    static isLeapJalaliYear(jy) { return isLeapJalaliYear(jy); }
    static jalaliMonthLength(jy, jm) { return jalaliMonthLength(jy, jm); }
  }

  return JalaliDate;
})();

export const JalaliDate = PersianDate;
export default PersianDate;