/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
const e = {
  322: (e) => {
    const t = function () {}
    t.prototype = {
      rotateLeft(e, t) {
        return e << t | e >>> 32 - t
      },
      addUnsigned(e, t) {
        let n, r, o, d, i
        return o = 2147483648 & e, d = 2147483648 & t, i = (1073741823 & e) + (
          1073741823 & t), (n = 1073741824 & e) & (r = 1073741824 & t)
          ? 2147483648 ^ i ^ o ^ d
          : n | r
            ? 1073741824 & i
              ? 3221225472 ^ i ^ o ^ d
              : 1073741824 ^ i ^ o ^ d
            : i ^ o ^ d
      },
      F(e, t, n) {
        return e & t | ~e & n
      },
      G(e, t, n) {
        return e & n | t & ~n
      },
      H(e, t, n) {
        return e ^ t ^ n
      },
      I(e, t, n) {
        return t ^ (e | ~n)
      },
      FF(e, t, n, r, o, d, i) {
        const a = this
        return e = a.addUnsigned(e, a.addUnsigned(a.addUnsigned(a.F(t, n, r), o), i)),
          a.addUnsigned(a.rotateLeft(e, d), t)
      },
      GG(e, t, n, r, o, d, i) {
        const a = this
        return e = a.addUnsigned(e, a.addUnsigned(a.addUnsigned(a.G(t, n, r), o), i)),
          a.addUnsigned(a.rotateLeft(e, d), t)
      },
      HH(e, t, n, r, o, d, i) {
        const a = this
        return e = a.addUnsigned(e, a.addUnsigned(a.addUnsigned(a.H(t, n, r), o), i)),
          a.addUnsigned(a.rotateLeft(e, d), t)
      },
      II(e, t, n, r, o, d, i) {
        const a = this
        return e = a.addUnsigned(e, a.addUnsigned(a.addUnsigned(a.I(t, n, r), o), i)),
          a.addUnsigned(a.rotateLeft(e, d), t)
      },
      convertToWordArray(e) {
        for (var t, n = e.length, r = n + 8, o = 16 * ((r - r % 64) / 64 + 1), d
          = Array(o - 1), i = 0, a = 0; a < n;) {
          i = a % 4 * 8, d[t = (a - a % 4)
            / 4] = d[t] | e.charCodeAt(a) << i, a++
        }
        return i = a % 4 * 8, d[t = (a - a % 4) / 4] = d[t] | 128 << i, d[o - 2] = n
          << 3, d[o - 1] = n >>> 29, d
      },
      wordToHex(e) {
        let t; let n = ''
        let r = ''
        for (t = 0; t <= 3; t++) {
          n += (r = `0${(e >>> 8 * t & 255).toString(16)}`).substr(
            r.length - 2,
            2,
          )
        }
        return n
      },
      uTF8Encode(e) {
        e = e.replace(/\x0D\x0A/g, '\n')
        for (var t = '', n = 0; n < e.length; n++) {
          const r = e.charCodeAt(n)
          r < 128
            ? t += String.fromCharCode(r)
            : r > 127 && r < 2048
              ? (t += String.fromCharCode(
                r >> 6 | 192,
              ), t += String.fromCharCode(63 & r | 128))
              : (t
                += String.fromCharCode(r >> 12 | 224), t += String.fromCharCode(r >> 6
                & 63 | 128), t += String.fromCharCode(63 & r | 128))
        }
        return t
      },
      md5(e, t) {
        let n; let r; let o; let d; let i; let a; let s; let u; let g; const c = this
        let l = []
        for (e = c.uTF8Encode(e), l = c.convertToWordArray(e), a = 1732584193, s
          = 4023233417, u = 2562383102, g = 271733878, n = 0; n < l.length; n += 16) {
          r
            = a, o = s, d = u, i = g, a = c.FF(a, s, u, g, l[n + 0], 7, 3614090360), g
            = c.FF(g, a, s, u, l[n + 1], 12, 3905402710), u = c.FF(u, g, a, s, l[n + 2], 17, 606105819), s = c.FF(s, u, g, a, l[n + 3], 22, 3250441966), a = c.FF(
            a,
            s,
            u,
            g,
            l[n + 4],
            7,
            4118548399,
          ), g = c.FF(g, a, s, u, l[n + 5], 12, 1200080426), u = c.FF(u, g, a, s, l[n + 6], 17, 2821735955), s = c.FF(s, u, g, a, l[n + 7], 22, 4249261313), a = c.FF(a, s, u, g, l[n + 8], 7, 1770035416), g = c.FF(g, a, s, u, l[n + 9], 12, 2336552879), u = c.FF(u, g, a, s, l[n + 10], 17, 4294925233), s = c.FF(s, u, g, a, l[n + 11], 22, 2304563134), a = c.FF(a, s, u, g, l[n + 12], 7, 1804603682), g = c.FF(g, a, s, u, l[n + 13], 12, 4254626195), u = c.FF(u, g, a, s, l[n + 14], 17, 2792965006), s = c.FF(s, u, g, a, l[n + 15], 22, 1236535329), a = c.GG(
            a,
            s,
            u,
            g,
            l[n + 1],
            5,
            4129170786,
          ), g = c.GG(g, a, s, u, l[n + 6], 9, 3225465664), u = c.GG(u, g, a, s, l[n + 11], 14, 643717713), s = c.GG(s, u, g, a, l[n + 0], 20, 3921069994), a = c.GG(a, s, u, g, l[n + 5], 5, 3593408605), g = c.GG(g, a, s, u, l[n + 10], 9, 38016083), u = c.GG(u, g, a, s, l[n + 15], 14, 3634488961), s = c.GG(s, u, g, a, l[n + 4], 20, 3889429448), a = c.GG(a, s, u, g, l[n + 9], 5, 568446438), g = c.GG(g, a, s, u, l[n + 14], 9, 3275163606), u = c.GG(u, g, a, s, l[n + 3], 14, 4107603335), s = c.GG(s, u, g, a, l[n + 8], 20, 1163531501), a = c.GG(a, s, u, g, l[n + 13], 5, 2850285829), g = c.GG(g, a, s, u, l[n + 2], 9, 4243563512), u = c.GG(u, g, a, s, l[n + 7], 14, 1735328473), s = c.GG(s, u, g, a, l[n + 12], 20, 2368359562), a = c.HH(a, s, u, g, l[n + 5], 4, 4294588738), g = c.HH(g, a, s, u, l[n + 8], 11, 2272392833), u = c.HH(u, g, a, s, l[n + 11], 16, 1839030562), s = c.HH(s, u, g, a, l[n + 14], 23, 4259657740), a = c.HH(a, s, u, g, l[n + 1], 4, 2763975236), g = c.HH(g, a, s, u, l[n + 4], 11, 1272893353), u = c.HH(u, g, a, s, l[n + 7], 16, 4139469664), s = c.HH(s, u, g, a, l[n + 10], 23, 3200236656), a = c.HH(
            a,
            s,
            u,
            g,
            l[n + 13],
            4,
            681279174,
          ), g = c.HH(g, a, s, u, l[n + 0], 11, 3936430074), u = c.HH(u, g, a, s, l[n + 3], 16, 3572445317), s = c.HH(s, u, g, a, l[n + 6], 23, 76029189), a = c.HH(a, s, u, g, l[n + 9], 4, 3654602809), g = c.HH(g, a, s, u, l[n + 12], 11, 3873151461), u = c.HH(
            u,
            g,
            a,
            s,
            l[n + 15],
            16,
            530742520,
          ), s = c.HH(s, u, g, a, l[n + 2], 23, 3299628645), a = c.II(a, s, u, g, l[n + 0], 6, 4096336452), g = c.II(
            g,
            a,
            s,
            u,
            l[n + 7],
            10,
            1126891415,
          ), u = c.II(u, g, a, s, l[n + 14], 15, 2878612391), s = c.II(s, u, g, a, l[n + 5], 21, 4237533241), a = c.II(
            a,
            s,
            u,
            g,
            l[n + 12],
            6,
            1700485571,
          ), g = c.II(g, a, s, u, l[n + 3], 10, 2399980690), u = c.II(u, g, a, s, l[n + 10], 15, 4293915773), s = c
            .II(s, u, g, a, l[n + 1], 21, 2240044497), a = c.II(a, s, u, g, l[n + 8], 6, 1873313359), g = c.II(g, a, s, u, l[n + 15], 10, 4264355552), u = c.II(
            u,
            g,
            a,
            s,
            l[n + 6],
            15,
            2734768916,
          ), s = c.II(s, u, g, a, l[n + 13], 21, 1309151649), a = c.II(a, s, u, g, l[n + 4], 6, 4149444226), g = c.II(
            g,
            a,
            s,
            u,
            l[n + 11],
            10,
            3174756917,
          ), u = c.II(u, g, a, s, l[n + 2], 15, 718787259), s = c.II(s, u, g, a, l[n + 9], 21, 3951481745), a = c.addUnsigned(
            a,
            r,
          ), s = c.addUnsigned(s, o), u = c.addUnsigned(u, d), g = c.addUnsigned(
            g,
            i,
          )
        }
        t((c.wordToHex(a) + c.wordToHex(s) + c.wordToHex(u) + c.wordToHex(g)).toLowerCase())
      },
    }
    const n = new t()
    e.exports = {
      md5(e, t) {
        n.md5(e, t)
      },
    }
  },
}
const t = {}

function n(r) {
  const o = t[r]
  if (void 0 !== o) {
    return o.exports
  }
  const d = t[r] = {
    exports: {},
  }
  return e[r](d, d.exports, n), d.exports
}
n.n = (e) => {
  const t = e && e.__esModule ? () => e.default : () => e
  return n.d(t, {
    a: t,
  }), t
}, n.d = (e, t) => {
  for (const r in t) {
    n.o(t, r) && !n.o(e, r) && Object.defineProperty(e, r, {
      enumerable: !0,
      get: t[r],
    })
  }
}, n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t), n.r = (e) => {
  typeof Symbol != 'undefined' && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
    value: 'Module',
  }), Object.defineProperty(e, '__esModule', {
    value: !0,
  })
}
const r = {};
(() => {
  'use strict'
  n.r(r), n.d(r, {
    default: () => i,
  })
  const e = n(322)
  const t = n.n(e)
  let o = null
  class d {
    url = 'https://api.bi.tengyouhy.cn/api/'
    post(e, n, r) {
      let d; const i = r
      t().md5(this._rand_id(), (e) => {
        d = e
      })
      const a = {
        request_id: d,
        time: Math.floor(Date.now() / 1e3),
      }
      const s = Object.entries(a)
      const u = {}
      u.ext = JSON.stringify(uni.getLaunchOptionsSync().query), n.appKey = o.appKey, u.partner_data
        = JSON.stringify(n), u.gid = 9999, u.pid = 9999, n.pid && (u.pid = n.pid), n.gid && (u.gid
        = n.gid), n.access_token && (u.access_token = n.access_token), n.mid && (u.mid = n.mid),
      n.p_mid && (u.p_mid = n.p_mid), u.request_id = d, u.time = a.time, u.tm = a.time, u.os
        = uni.getSystemInfoSync().platform
      let g = ''
      for (const e in s) {
        s[e][1].toString().length && (g += `${s[e][0]}=${s[e][1]}&`)
      }
      t().md5(g, (e) => {
        u.sign = e
      }), uni.request({
        url: this.url + e,
        method: 'post',
        data: u,
        header: {
          'content-type': 'application/json',
        },
        success(e) {
          i(e)
        },
      })
    }

    _rand_id() {
      const e = new Date()
      console.log(e.toLocaleString())
      let t = 'suyun'
      const n = Number.parseInt(9e3 * Math.random() + 1e3, 10)
      return t += e.getFullYear(), t += e.getMonth() + 1, t += e.getDate(), t += e.getHours(), t
        += e.getMinutes(), t += e.getSeconds(), t += n, t
    }
  }
  const i = class {
    loginData
    constructor(e) {
      o = e, this.request = new d(), console.log('wdh init', e)
    }

    reportActive(e) {
      const t = this
      if (o == null) {
        return console.log('wdh reportActive 还没初始化'), !1
      }
      console.log('wdh reportActive', e), this.request.post('partner/login', e, (e) => {
        t.loginData = e.data
      })
    }

    reportOrder(e) {
      if (o == null) {
        return console.log('wdh reportOrder 还没初始化 '), !1
      }
      (e = {
        orderId: 1111,
        fee: 88,
        orderType: 1,
        createTime: '121',
        dealTime: '1212',
      }).access_token = this.loginData.access_token, e.gid = this.loginData.gid, e.pid = this
        .loginData.pid, e.mid = this.loginData.mid, e.p_mid = this.loginData.p_mid, console
        .log('wdh reportOrder', e), this.request.post('suyun/getDotOrderData', e, (
        e) => {
        console.log('wdh reportOrder 上报', e)
      })
    }
  }
})()

export default r
