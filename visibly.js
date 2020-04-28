(function () {
  window.visibly = {
    q: document,
    p: undefined,
    prefixes: ["webkit", "ms", "o", "moz", "khtml"],
    props: ["VisibilityState", "visibilitychange", "Hidden"],
    m: ["focus", "blur"],
    visibleCallbacks: [],
    hiddenCallbacks: [],
    genericCallbacks: [],
    _callbacks: [],
    cachedPrefix: "",
    fn: null,
    onVisible: function (i) {
      if (typeof i == "function") {
        this.visibleCallbacks.push(i);
      }
    },
    onHidden: function (i) {
      if (typeof i == "function") {
        this.hiddenCallbacks.push(i);
      }
    },
    getPrefix: function () {
      if (!this.cachedPrefix) {
        for (var i = 0; (b = this.prefixes[i++]); ) {
          if (b + this.props[2] in this.q) {
            this.cachedPrefix = b;
            return this.cachedPrefix;
          }
        }
      }
    },
    visibilityState: function () {
      return this._getProp(0);
    },
    hidden: function () {
      return this._getProp(2);
    },
    visibilitychange: function (i) {
      if (typeof i == "function") {
        this.genericCallbacks.push(i);
      }
      var t = this.genericCallbacks.length;
      if (t) {
        if (this.cachedPrefix) {
          while (t--) {
            this.genericCallbacks[t].call(this, this.visibilityState());
          }
        } else {
          while (t--) {
            this.genericCallbacks[t].call(this, arguments[0]);
          }
        }
      }
    },
    isSupported: function (i) {
      return this.cachedPrefix + this.props[2] in this.q;
    },
    _getProp: function (i) {
      return this.q[this.cachedPrefix + this.props[i]];
    },
    _execute: function (i) {
      if (i) {
        this._callbacks = i == 1 ? this.visibleCallbacks : this.hiddenCallbacks;
        var t = this._callbacks.length;
        while (t--) {
          this._callbacks[t]();
        }
      }
    },
    _visible: function () {
      window.visibly._execute(1);
      window.visibly.visibilitychange.call(window.visibly, "visible");
    },
    _hidden: function () {
      window.visibly._execute(2);
      window.visibly.visibilitychange.call(window.visibly, "hidden");
    },
    _nativeSwitch: function () {
      this[this._getProp(2) ? "_hidden" : "_visible"]();
    },
    _listen: function () {
      try {
        if (!this.isSupported()) {
          if (this.q.addEventListener) {
            window.addEventListener(this.m[0], this._visible, 1);
            window.addEventListener(this.m[1], this._hidden, 1);
          } else {
            if (this.q.attachEvent) {
              this.q.attachEvent("onfocusin", this._visible);
              this.q.attachEvent("onfocusout", this._hidden);
            }
          }
        } else {
          this.q.addEventListener(
            this.cachedPrefix + this.props[1],
            function () {
              window.visibly._nativeSwitch.apply(window.visibly, arguments);
            },
            1
          );
        }
      } catch (i) {}
    },
    init: function () {
      this.getPrefix();
      this._listen();
    },
  };
  this.visibly.init();
})();
