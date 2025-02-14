(function () {
  "use strict";
  function L() {
    const e = performance.now() / 1e3;
    return Math.round(e * 1e4) / 1e4;
  }
  let p = 0,
    d = 0,
    f = 0,
    o = 0.5;
  const g = new Map(),
    C = 0.1,
    b = new BroadcastChannel("strudeltick"),
    I = (s, e) => {
      b.postMessage({ type: s, payload: e });
    },
    M = O(
      L,
      (s, e, t, n) => {
        const i = d * e,
          l = s - n,
          c = n + l,
          h = i * o,
          r = p + h,
          y = n - c - e,
          k = e * o,
          _ = r + k,
          m = r + y * o;
        I("tick", {
          begin: r,
          end: _,
          cps: o,
          tickdeadline: l,
          num_cycles_at_cps_change: p,
          num_seconds_at_cps_change: f,
          num_seconds_since_cps_change: i,
          cycle: m,
        }),
          d++;
      },
      C
    );
  let u = !1;
  const A = (s) => {
      g.set(s, { started: !0 }), !u && (M.start(), (u = !0));
    },
    D = async (s) => {
      g.set(s, { started: !1 });
      const e = Array.from(g.values()).some((t) => t.started);
      !u || e || (M.stop(), w(0), (u = !1));
    },
    w = (s) => {
      (d = 0), (p = s);
    },
    E = (s) => {
      const { type: e, payload: t } = s;
      switch (e) {
        case "cpschange": {
          if (t.cps !== o) {
            const n = d * C;
            (p = p + n * o), (f = f + n), (o = t.cps), (d = 0);
          }
          break;
        }
        case "setcycle": {
          w(t.cycle);
          break;
        }
        case "toggle": {
          t.started ? A(s.id) : D(s.id);
          break;
        }
      }
    };
  self.onconnect = function (s) {
    const e = s.ports[0];
    e.addEventListener("message", function (t) {
      E(t.data);
    }),
      e.start();
  };
  function O(s, e, t = 0.05, n = 0.1, i = 0.1) {
    let l = 0,
      c = 0,
      h = 10 ** 4,
      r = 0.01;
    const y = (a) => (t = a(t));
    i = i || n / 2;
    const k = () => {
      const a = s(),
        P = a + n + i;
      for (c === 0 && (c = a + r); c < P; )
        (c = Math.round(c * h) / h),
          c >= a && e(c, t, l, a),
          c < a && console.log("TOO LATE", c),
          (c += t),
          l++;
    };
    let _;
    const m = () => {
        T(), k(), (_ = setInterval(k, n * 1e3));
      },
      T = () => _ !== void 0 && clearInterval(_);
    return {
      setDuration: y,
      start: m,
      stop: () => {
        (l = 0), (c = 0), T();
      },
      pause: () => T(),
      duration: t,
      interval: n,
      getPhase: () => c,
      minLatency: r,
    };
  }
})();
