/**
 * JAM UTC LIVE (pelanggan) — HH:MM:SS UTC dari jam browser (Date.getUTC*), diperbarui tiap detik.
 * Tanpa request ke database / server. Berhenti saat tab disembunyikan, langsung tepat lagi saat tab dibuka.
 * Elemen dengan atribut data-utc-clock diisi otomatis; modul lain bisa ikut tiap detik lewat onUtcTick(fn).
 */
const _utcSubs = new Set();
let _utcTimer = null;
const pad2 = n => String(n).padStart(2, "0");
/** menit sejak 00:00 UTC (0 – 1439) */
function utcMinutesNow(d = new Date()) { return d.getUTCHours() * 60 + d.getUTCMinutes(); }
/** "HH:MM" dari menit sejak 00:00 UTC */
function fmtUtcHM(min) { return pad2(Math.floor(min / 60)) + ":" + pad2(min % 60); }
function utcClockText(d = new Date()) { return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} UTC`; }
/** daftarkan fungsi yang dipanggil tiap detik (mengembalikan fungsi untuk berhenti) */
function onUtcTick(fn) { _utcSubs.add(fn); return () => _utcSubs.delete(fn); }

function _utcTick() {
    const d = new Date(), txt = utcClockText(d);
    document.querySelectorAll("[data-utc-clock]").forEach(el => { if (el.textContent !== txt) el.textContent = txt; });
    _utcSubs.forEach(fn => { try { fn(d); } catch (e) { console.warn("utc tick:", e); } });
}
function _utcStart() {
    if (_utcTimer) return;
    _utcTick();
    // selaraskan ke awal detik berikutnya supaya detik berganti tepat waktu
    _utcTimer = setTimeout(function loop() { _utcTick(); _utcTimer = setTimeout(loop, 1000 - (Date.now() % 1000)); }, 1000 - (Date.now() % 1000));
}
function _utcStop() { if (_utcTimer) clearTimeout(_utcTimer); _utcTimer = null; }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") _utcStart(); else _utcStop(); });
document.addEventListener("DOMContentLoaded", _utcStart);
