/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
! function (t, e) {
  if ("object" == typeof exports && "object" == typeof module) module.exports = e();
  else if ("function" == typeof define && define.amd) define([], e);
  else {
    var n = e();
    for (var o in n)("object" == typeof exports ? exports : t)[o] = n[o]
  }
}(this, (() => (() => {
  var t = {
      21: function (t, e, n) {
        var o;
        t.exports = (o = o || function (t) {
          var e;
          if ("undefined" != typeof window && window.crypto && (e = window.crypto),
          "undefined" != typeof self && self.crypto && (e = self.crypto),
          "undefined" != typeof globalThis && globalThis.crypto && (e =
            globalThis.crypto), !e && "undefined" != typeof window && window.msCrypto &&
          (e = window.msCrypto), !e && void 0 !== n.g && n.g.crypto && (e = n.g.crypto),
            !e) try {
            e = n(477)
          } catch (t) {}
          var o = function () {
              if (e) {
                if ("function" == typeof e.getRandomValues) try {
                  return e.getRandomValues(new Uint32Array(1))[0]
                } catch (t) {}
                if ("function" == typeof e.randomBytes) try {
                  return e.randomBytes(4).readInt32LE()
                } catch (t) {}
              }
              throw new Error(
                "Native crypto module could not be used to get secure random number."
              )
            },
            i = Object.create || function () {
              function t() {}
              return function (e) {
                var n;
                return t.prototype = e, n = new t, t.prototype = null, n
              }
            }(),
            r = {},
            s = r.lib = {},
            a = s.Base = {
              extend: function (t) {
                var e = i(this);
                return t && e.mixIn(t), e.hasOwnProperty("init") && this.init !==
                e.init || (e.init = function () {
                  e.$super.init.apply(this, arguments)
                }), e.init.prototype = e, e.$super = this, e
              },
              create: function () {
                var t = this.extend();
                return t.init.apply(t, arguments), t
              },
              init: function () {},
              mixIn: function (t) {
                for (var e in t) t.hasOwnProperty(e) && (this[e] = t[e]);
                t.hasOwnProperty("toString") && (this.toString = t.toString)
              },
              clone: function () {
                return this.init.prototype.extend(this)
              }
            },
            c = s.WordArray = a.extend({
              init: function (t, e) {
                t = this.words = t || [], this.sigBytes = null != e ? e :
                  4 * t.length
              },
              toString: function (t) {
                return (t || l).stringify(this)
              },
              concat: function (t) {
                var e = this.words,
                  n = t.words,
                  o = this.sigBytes,
                  i = t.sigBytes;
                if (this.clamp(), o % 4)
                  for (var r = 0; r < i; r++) {
                    var s = n[r >>> 2] >>> 24 - r % 4 * 8 & 255;
                    e[o + r >>> 2] |= s << 24 - (o + r) % 4 * 8
                  } else
                  for (var a = 0; a < i; a += 4) e[o + a >>> 2] =
                    n[a >>> 2];
                return this.sigBytes += i, this
              },
              clamp: function () {
                var e = this.words,
                  n = this.sigBytes;
                e[n >>> 2] &= 4294967295 << 32 - n % 4 * 8, e.length =
                  t.ceil(n / 4)
              },
              clone: function () {
                var t = a.clone.call(this);
                return t.words = this.words.slice(0), t
              },
              random: function (t) {
                for (var e = [], n = 0; n < t; n += 4) e.push(o());
                return new c.init(e, t)
              }
            }),
            d = r.enc = {},
            l = d.Hex = {
              stringify: function (t) {
                for (var e = t.words, n = t.sigBytes, o = [], i = 0; i < n; i++) {
                  var r = e[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                  o.push((r >>> 4).toString(16)), o.push((15 & r).toString(
                    16))
                }
                return o.join("")
              },
              parse: function (t) {
                for (var e = t.length, n = [], o = 0; o < e; o += 2) n[o >>>
                3] |= parseInt(t.substr(o, 2), 16) << 24 - o % 8 *
                  4;
                return new c.init(n, e / 2)
              }
            },
            u = d.Latin1 = {
              stringify: function (t) {
                for (var e = t.words, n = t.sigBytes, o = [], i = 0; i < n; i++) {
                  var r = e[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                  o.push(String.fromCharCode(r))
                }
                return o.join("")
              },
              parse: function (t) {
                for (var e = t.length, n = [], o = 0; o < e; o++) n[o >>>
                2] |= (255 & t.charCodeAt(o)) << 24 - o % 4 * 8;
                return new c.init(n, e)
              }
            },
            h = d.Utf8 = {
              stringify: function (t) {
                try {
                  return decodeURIComponent(escape(u.stringify(t)))
                } catch (t) {
                  throw new Error("Malformed UTF-8 data")
                }
              },
              parse: function (t) {
                return u.parse(unescape(encodeURIComponent(t)))
              }
            },
            f = s.BufferedBlockAlgorithm = a.extend({
              reset: function () {
                this._data = new c.init, this._nDataBytes = 0
              },
              _append: function (t) {
                "string" == typeof t && (t = h.parse(t)), this._data.concat(
                  t), this._nDataBytes += t.sigBytes
              },
              _process: function (e) {
                var n, o = this._data,
                  i = o.words,
                  r = o.sigBytes,
                  s = this.blockSize,
                  a = r / (4 * s),
                  d = (a = e ? t.ceil(a) : t.max((0 | a) - this._minBufferSize,
                    0)) * s,
                  l = t.min(4 * d, r);
                if (d) {
                  for (var u = 0; u < d; u += s) this._doProcessBlock(
                    i, u);
                  n = i.splice(0, d), o.sigBytes -= l
                }
                return new c.init(n, l)
              },
              clone: function () {
                var t = a.clone.call(this);
                return t._data = this._data.clone(), t
              },
              _minBufferSize: 0
            }),
            p = (s.Hasher = f.extend({
              cfg: a.extend(),
              init: function (t) {
                this.cfg = this.cfg.extend(t), this.reset()
              },
              reset: function () {
                f.reset.call(this), this._doReset()
              },
              update: function (t) {
                return this._append(t), this._process(), this
              },
              finalize: function (t) {
                return t && this._append(t), this._doFinalize()
              },
              blockSize: 16,
              _createHelper: function (t) {
                return function (e, n) {
                  return new t.init(n).finalize(e)
                }
              },
              _createHmacHelper: function (t) {
                return function (e, n) {
                  return new p.HMAC.init(t, n).finalize(e)
                }
              }
            }), r.algo = {});
          return r
        }(Math), o)
      },
      636: function (t, e, n) {
        var o;
        t.exports = (o = n(21), function (t) {
          var e = o,
            n = e.lib,
            i = n.WordArray,
            r = n.Hasher,
            s = e.algo,
            a = [];
          ! function () {
            for (var e = 0; e < 64; e++) a[e] = 4294967296 * t.abs(t.sin(e + 1)) |
              0
          }();
          var c = s.MD5 = r.extend({
            _doReset: function () {
              this._hash = new i.init([1732584193, 4023233417,
                2562383102, 271733878])
            },
            _doProcessBlock: function (t, e) {
              for (var n = 0; n < 16; n++) {
                var o = e + n,
                  i = t[o];
                t[o] = 16711935 & (i << 8 | i >>> 24) | 4278255360 &
                  (i << 24 | i >>> 8)
              }
              var r = this._hash.words,
                s = t[e + 0],
                c = t[e + 1],
                f = t[e + 2],
                p = t[e + 3],
                g = t[e + 4],
                y = t[e + 5],
                m = t[e + 6],
                w = t[e + 7],
                v = t[e + 8],
                _ = t[e + 9],
                b = t[e + 10],
                x = t[e + 11],
                S = t[e + 12],
                B = t[e + 13],
                I = t[e + 14],
                P = t[e + 15],
                M = r[0],
                O = r[1],
                j = r[2],
                C = r[3];
              M = d(M, O, j, C, s, 7, a[0]), C = d(C, M, O, j, c, 12,
                a[1]), j = d(j, C, M, O, f, 17, a[2]), O = d(O,
                j, C, M, p, 22, a[3]), M = d(M, O, j, C, g, 7,
                a[4]), C = d(C, M, O, j, y, 12, a[5]), j = d(j,
                C, M, O, m, 17, a[6]), O = d(O, j, C, M, w, 22,
                a[7]), M = d(M, O, j, C, v, 7, a[8]), C = d(C,
                M, O, j, _, 12, a[9]), j = d(j, C, M, O, b, 17,
                a[10]), O = d(O, j, C, M, x, 22, a[11]), M = d(
                M, O, j, C, S, 7, a[12]), C = d(C, M, O, j, B,
                12, a[13]), j = d(j, C, M, O, I, 17, a[14]), M =
                l(M, O = d(O, j, C, M, P, 22, a[15]), j, C, c, 5, a[
                  16]), C = l(C, M, O, j, m, 9, a[17]), j = l(j,
                C, M, O, x, 14, a[18]), O = l(O, j, C, M, s, 20,
                a[19]), M = l(M, O, j, C, y, 5, a[20]), C = l(C,
                M, O, j, b, 9, a[21]), j = l(j, C, M, O, P, 14,
                a[22]), O = l(O, j, C, M, g, 20, a[23]), M = l(
                M, O, j, C, _, 5, a[24]), C = l(C, M, O, j, I,
                9, a[25]), j = l(j, C, M, O, p, 14, a[26]), O =
                l(O, j, C, M, v, 20, a[27]), M = l(M, O, j, C, B, 5,
                a[28]), C = l(C, M, O, j, f, 9, a[29]), j = l(j,
                C, M, O, w, 14, a[30]), M = u(M, O = l(O, j, C,
                M, S, 20, a[31]), j, C, y, 4, a[32]), C = u(C,
                M, O, j, v, 11, a[33]), j = u(j, C, M, O, x, 16,
                a[34]), O = u(O, j, C, M, I, 23, a[35]), M = u(
                M, O, j, C, c, 4, a[36]), C = u(C, M, O, j, g,
                11, a[37]), j = u(j, C, M, O, w, 16, a[38]), O =
                u(O, j, C, M, b, 23, a[39]), M = u(M, O, j, C, B, 4,
                a[40]), C = u(C, M, O, j, s, 11, a[41]), j = u(
                j, C, M, O, p, 16, a[42]), O = u(O, j, C, M, m,
                23, a[43]), M = u(M, O, j, C, _, 4, a[44]), C =
                u(C, M, O, j, S, 11, a[45]), j = u(j, C, M, O, P,
                16, a[46]), M = h(M, O = u(O, j, C, M, f, 23, a[
                47]), j, C, s, 6, a[48]), C = h(C, M, O, j, w,
                10, a[49]), j = h(j, C, M, O, I, 15, a[50]), O =
                h(O, j, C, M, y, 21, a[51]), M = h(M, O, j, C, S, 6,
                a[52]), C = h(C, M, O, j, p, 10, a[53]), j = h(
                j, C, M, O, b, 15, a[54]), O = h(O, j, C, M, c,
                21, a[55]), M = h(M, O, j, C, v, 6, a[56]), C =
                h(C, M, O, j, P, 10, a[57]), j = h(j, C, M, O, m,
                15, a[58]), O = h(O, j, C, M, B, 21, a[59]), M =
                h(M, O, j, C, g, 6, a[60]), C = h(C, M, O, j, x, 10,
                a[61]), j = h(j, C, M, O, f, 15, a[62]), O = h(
                O, j, C, M, _, 21, a[63]), r[0] = r[0] + M | 0,
                r[1] = r[1] + O | 0, r[2] = r[2] + j | 0, r[3] = r[
                3] + C | 0
            },
            _doFinalize: function () {
              var e = this._data,
                n = e.words,
                o = 8 * this._nDataBytes,
                i = 8 * e.sigBytes;
              n[i >>> 5] |= 128 << 24 - i % 32;
              var r = t.floor(o / 4294967296),
                s = o;
              n[15 + (i + 64 >>> 9 << 4)] = 16711935 & (r << 8 | r >>>
                24) | 4278255360 & (r << 24 | r >>> 8), n[14 +
              (i + 64 >>> 9 << 4)] = 16711935 & (s << 8 | s >>>
                24) | 4278255360 & (s << 24 | s >>> 8), e.sigBytes =
                4 * (n.length + 1), this._process();
              for (var a = this._hash, c = a.words, d = 0; d < 4; d++) {
                var l = c[d];
                c[d] = 16711935 & (l << 8 | l >>> 24) | 4278255360 &
                  (l << 24 | l >>> 8)
              }
              return a
            },
            clone: function () {
              var t = r.clone.call(this);
              return t._hash = this._hash.clone(), t
            }
          });

          function d(t, e, n, o, i, r, s) {
            var a = t + (e & n | ~e & o) + i + s;
            return (a << r | a >>> 32 - r) + e
          }

          function l(t, e, n, o, i, r, s) {
            var a = t + (e & o | n & ~o) + i + s;
            return (a << r | a >>> 32 - r) + e
          }

          function u(t, e, n, o, i, r, s) {
            var a = t + (e ^ n ^ o) + i + s;
            return (a << r | a >>> 32 - r) + e
          }

          function h(t, e, n, o, i, r, s) {
            var a = t + (n ^ (e | ~o)) + i + s;
            return (a << r | a >>> 32 - r) + e
          }
          e.MD5 = r._createHelper(c), e.HmacMD5 = r._createHmacHelper(c)
        }(Math), o.MD5)
      },
      477: () => {}
    },
    e = {};

  function n(o) {
    var i = e[o];
    if (void 0 !== i) return i.exports;
    var r = e[o] = {
      exports: {}
    };
    return t[o].call(r.exports, r, r.exports, n), r.exports
  }
  n.n = t => {
    var e = t && t.__esModule ? () => t.default : () => t;
    return n.d(e, {
      a: e
    }), e
  }, n.d = (t, e) => {
    for (var o in e) n.o(e, o) && !n.o(t, o) && Object.defineProperty(t, o, {
      enumerable: !0,
      get: e[o]
    })
  }, n.g = function () {
    if ("object" == typeof globalThis) return globalThis;
    try {
      return this || new Function("return this")()
    } catch (t) {
      if ("object" == typeof window) return window
    }
  }(), n.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e), n.r = t => {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
      value: "Module"
    }), Object.defineProperty(t, "__esModule", {
      value: !0
    })
  };
  var o = {};
  return (() => {
    "use strict";
    n.r(o);
    var t = n(636),
      e = n.n(t);
    class i {
      postWithXhr(t, e) {
        return new Promise(((n, o) => {
          const i = new XMLHttpRequest;
          i.open("POST", t, !0), i.setRequestHeader("Content-Type",
            "application/json;charset=UTF-8"), i.onload = () => {
            i.status >= 200 && i.status < 300 ? n(JSON.parse(i.responseText)) :
              o(new Error(
                `Failed to fetch: ${i.status} ${i.statusText}`
              ))
          }, i.onerror = () => {
            o(new Error("Network error"))
          }, i.send(JSON.stringify(e))
        }))
      }
    }
    let r = new class {
      constructor() {
        this.data = {}, this.ext = {}, this.bd_vid = "wdh_bd_vid", this.mid =
          "wdh_mid", this.p_mid = "wdh_p_mid", this.host =
          "https://api.bi.tengyouhy.cn/";
        const t = function () {
          const t = /([^&=]+)=([^&]*)/g,
            e = {},
            n = window.location.hash,
            o = n.includes("?") ? n.split("?")[1] : "";
          let i;
          for (; i = t.exec(o);) e[decodeURIComponent(i[1])] =
            decodeURIComponent(i[2]);
          const r = window.location.search.substr(1);
          let s;
          for (; s = t.exec(r);) e[decodeURIComponent(s[1])] =
            decodeURIComponent(s[2]);
          return console.log(o, e, "params getQueryParameters"), e
        }();
        console.log(t);
        let e = localStorage.getItem(this.bd_vid),
          n = localStorage.getItem(this.mid),
          o = localStorage.getItem(this.p_mid);
        console.log("cookies bd_vid", e), null == e && void 0 !== t.bd_vid && (
          console.log("queryParams bd_vid", t.bd_vid, window.location.href),
            localStorage.setItem(this.bd_vid, window.location.href)), null == n &&
        void 0 !== t.mid && (console.log("queryParams mid", t.mid),
          localStorage.setItem(this.mid, t.mid)), null == o && void 0 !== t.p_mid &&
        (console.log("queryParams p_mid", t.p_mid), localStorage.setItem(this.p_mid,
          t.p_mid))
      }
      init(t) {
        this.config = t, null != t && null != t.appKey ? console.log(
          "wdh init success") : console.log("appKey is required")
      }

      md5 (str) {
        return e()(str).toString()
      }
      reportActive(t) {
        if (null == this.config) return void console.log("wdh init 还没初始化成功");
        if (null == this.config.appKey) return void console.log(
          "wdh reportActive 还没初始化成功");
        const n = function () {
            const t = Date.now();
            let e = Math.floor(1e4 * Math.random()).toString();
            for (; e.length < 4;) e = "0" + e;
            return `${t}-${e}`
          }(),
          o = {
            request_id: n,
            time: Math.floor(Date.now() / 1e3)
          };
        t.appKey = this.config.appKey, this.ext.bd_vid = localStorage.getItem(this.bd_vid),
          this.ext.p_mid = localStorage.getItem(this.p_mid), this.ext.mid =
          localStorage.getItem(this.mid);
        const r = {
          partner_data: JSON.stringify(t),
          gid: 999,
          pid: 999,
          request_id: n,
          time: o.time,
          tm: o.time,
          sign: "",
          ext: JSON.stringify(this.ext),
          os: (s = navigator.userAgent, /windows phone/i.test(s) ?
            "Windows Phone" : /android/i.test(s) ? "android" :
              /iPad|iPhone|iPod/.test(s) ? "ios" : /windows/.test(s) ?
                "windows" : /macintosh|mac os x/.test(s) ? "mac" :
                  /opera|opr/.test(s) ? "opera" : "unknown")
        };
        var s;
        let a = "";
        const c = ["request_id", "time"];
        for (let t = 0; t < c.length; t++) {
          const e = c[t];
          let n;
          n = "request_id" == e ? o.request_id : o.time, n.toString().length && (
            a += `${e}=${n}&`)
        }
        r.sign = e()(a).toString(), (new i).postWithXhr(this.host +
          "api/partner/login", r).then((t => {
          console.log("reportActive success")
        })).catch((t => {
          console.error("Error posting data:", t)
        }))
      }
    };
    window.wdhBaidu = r
  })(), o
})()));
