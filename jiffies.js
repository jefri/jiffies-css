var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
/**
https://github.com/frenic/csstype v3.0.11
Copyright (c) 2017-2018 Fredrik Nicol

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
define("dom/types/css", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
});
define("dom/dom", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.update =
    exports.up =
    exports.normalizeArguments =
    exports.CLEAR =
      void 0;
  const Events = Symbol("events");
  exports.CLEAR = Symbol("Clear children");
  function isAttrs(attrs) {
    if (!attrs) {
      return false;
    }
    if (typeof attrs === "object") {
      return !attrs.nodeType;
    }
    return false;
  }
  function normalizeArguments(attrs, children = [], defaultAttrs = {}) {
    let attributes;
    if (isAttrs(attrs)) {
      attributes = attrs;
    } else {
      if (attrs !== undefined) {
        children.unshift(attrs);
      }
      attributes = defaultAttrs;
    }
    return [attributes, children.flat()];
  }
  exports.normalizeArguments = normalizeArguments;
  function up(element, attrs, ...children) {
    return update(element, ...normalizeArguments(attrs, children));
  }
  exports.up = up;
  function update(element, attrs, children) {
    // Track events, to remove later
    const $events = (element[Events] ??= new Map());
    const { style = {}, events = {}, ...rest } = attrs;
    Object.entries(events).forEach(([k, v]) => {
      if (v === null) {
        if ($events.has(k)) {
          const listener = $events.get(k);
          element.removeEventListener(k, listener);
        }
      } else if (v !== undefined) {
        element.addEventListener(k, v);
        $events.set(k, v);
      }
    });
    const _style = element.style;
    if (_style) {
      if (typeof style === "string") {
        _style.cssText = style;
      } else {
        Object.entries(style).forEach(([k, v]) => {
          _style.setProperty?.(k, v);
        });
      }
    }
    Object.entries(rest).forEach(([k, v]) => {
      if (k === "class") {
        v = Array.isArray(v)
          ? v
          : (typeof v === "string" ? v : `${v}`).split(/\s+/m);
        v.filter((s) => s !== "").forEach((c) => {
          if (c.startsWith("!")) {
            element.classList.remove(c.substring(1));
          } else {
            element.classList.add(c);
          }
        });
        return;
      }
      const useNamespace =
        element.namespaceURI &&
        element.namespaceURI != "http://www.w3.org/1999/xhtml";
      const remove = !v;
      if (useNamespace) {
        if (remove) {
          element.removeAttributeNS(element.namespaceURI, k);
        } else if (v === true) {
          element.setAttributeNS(element.namespaceURI, k, k);
        } else {
          element.setAttributeNS(element.namespaceURI, k, v);
        }
      } else {
        if (remove) {
          element.removeAttribute(k);
        } else if (v === true) {
          element.setAttribute(k, k);
        } else {
          element.setAttribute(k, v);
        }
      }
    });
    if (children?.length > 0) {
      element.replaceChildren(
        ...(children[0] === exports.CLEAR ? [] : children)
      );
    }
    element.update ??= (attrs, ...children) =>
      update(element, ...normalizeArguments(attrs, children));
    return element;
  }
  exports.update = update;
});
define("dom/fc", ["require", "exports", "dom/dom"], function (
  require,
  exports,
  dom_js_1
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.FC = exports.State = void 0;
  exports.State = Symbol();
  function FC(name, component) {
    class FCImpl extends HTMLElement {
      constructor() {
        super();
      }
      [exports.State] = {};
      #attrs = {};
      #children = [];
      update(attrs, ...children) {
        [attrs, children] = (0, dom_js_1.normalizeArguments)(attrs, children);
        if (children[0] === dom_js_1.CLEAR) {
          this.#children = [];
        } else if (children.length > 0) {
          this.#children = children;
        }
        this.#attrs = { ...this.#attrs, ...attrs };
        // Apply updates from the attrs to the dom node itself
        (0, dom_js_1.update)(this, this.#attrs, []);
        // Re-run the component function using new element, attrs, and children.
        const replace = [component(this, this.#attrs, this.#children)];
        this.replaceChildren(...replace.flat());
        return this;
      }
    }
    customElements.define(name, FCImpl);
    const ctor = (attrs, ...children) => {
      const element = document.createElement(name);
      element.update(attrs, ...children);
      return element;
    };
    return ctor;
  }
  exports.FC = FC;
});
define("dom/html", ["require", "exports", "dom/dom"], function (
  require,
  exports,
  dom_js_2
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.wbr =
    exports.video =
    exports.htmlvar =
    exports.ul =
    exports.u =
    exports.track =
    exports.tr =
    exports.title =
    exports.time =
    exports.thead =
    exports.th =
    exports.tfoot =
    exports.textarea =
    exports.template =
    exports.td =
    exports.tbody =
    exports.table =
    exports.sup =
    exports.summary =
    exports.sub =
    exports.style =
    exports.strong =
    exports.span =
    exports.source =
    exports.small =
    exports.slot =
    exports.select =
    exports.section =
    exports.script =
    exports.samp =
    exports.s =
    exports.ruby =
    exports.rt =
    exports.rp =
    exports.q =
    exports.progress =
    exports.pre =
    exports.picture =
    exports.param =
    exports.p =
    exports.output =
    exports.option =
    exports.optgroup =
    exports.ol =
    exports.object =
    exports.noscript =
    exports.nav =
    exports.meter =
    exports.meta =
    exports.menu =
    exports.mark =
    exports.map =
    exports.main =
    exports.link =
    exports.li =
    exports.legend =
    exports.label =
    exports.kbd =
    exports.ins =
    exports.input =
    exports.img =
    exports.iframe =
    exports.i =
    exports.html =
    exports.hr =
    exports.hgroup =
    exports.header =
    exports.head =
    exports.h6 =
    exports.h5 =
    exports.h4 =
    exports.h3 =
    exports.h2 =
    exports.h1 =
    exports.form =
    exports.footer =
    exports.figure =
    exports.figcaption =
    exports.fieldset =
    exports.embed =
    exports.em =
    exports.dt =
    exports.dl =
    exports.div =
    exports.dialog =
    exports.dfn =
    exports.details =
    exports.del =
    exports.dd =
    exports.datalist =
    exports.data =
    exports.colgroup =
    exports.col =
    exports.code =
    exports.cite =
    exports.caption =
    exports.canvas =
    exports.button =
    exports.br =
    exports.body =
    exports.blockquote =
    exports.bdo =
    exports.bdi =
    exports.base =
    exports.b =
    exports.audio =
    exports.aside =
    exports.article =
    exports.area =
    exports.address =
    exports.abbr =
    exports.a =
      void 0;
  const makeHTMLElement =
    (name) =>
    (attrs, ...children) =>
      (0, dom_js_2.up)(document.createElement(name), attrs, ...children);
  exports.a = makeHTMLElement("a");
  exports.abbr = makeHTMLElement("abbr");
  exports.address = makeHTMLElement("address");
  exports.area = makeHTMLElement("area");
  exports.article = makeHTMLElement("article");
  exports.aside = makeHTMLElement("aside");
  exports.audio = makeHTMLElement("audio");
  exports.b = makeHTMLElement("b");
  exports.base = makeHTMLElement("base");
  exports.bdi = makeHTMLElement("bdi");
  exports.bdo = makeHTMLElement("bdo");
  exports.blockquote = makeHTMLElement("blockquote");
  exports.body = makeHTMLElement("body");
  exports.br = makeHTMLElement("br");
  exports.button = makeHTMLElement("button");
  exports.canvas = makeHTMLElement("canvas");
  exports.caption = makeHTMLElement("caption");
  exports.cite = makeHTMLElement("cite");
  exports.code = makeHTMLElement("code");
  exports.col = makeHTMLElement("col");
  exports.colgroup = makeHTMLElement("colgroup");
  exports.data = makeHTMLElement("data");
  exports.datalist = makeHTMLElement("datalist");
  exports.dd = makeHTMLElement("dd");
  exports.del = makeHTMLElement("del");
  exports.details = makeHTMLElement("details");
  exports.dfn = makeHTMLElement("dfn");
  exports.dialog = makeHTMLElement("dialog");
  exports.div = makeHTMLElement("div");
  exports.dl = makeHTMLElement("dl");
  exports.dt = makeHTMLElement("dt");
  exports.em = makeHTMLElement("em");
  exports.embed = makeHTMLElement("embed");
  exports.fieldset = makeHTMLElement("fieldset");
  exports.figcaption = makeHTMLElement("figcaption");
  exports.figure = makeHTMLElement("figure");
  exports.footer = makeHTMLElement("footer");
  exports.form = makeHTMLElement("form");
  exports.h1 = makeHTMLElement("h1");
  exports.h2 = makeHTMLElement("h2");
  exports.h3 = makeHTMLElement("h3");
  exports.h4 = makeHTMLElement("h4");
  exports.h5 = makeHTMLElement("h5");
  exports.h6 = makeHTMLElement("h6");
  exports.head = makeHTMLElement("head");
  exports.header = makeHTMLElement("header");
  exports.hgroup = makeHTMLElement("hgroup");
  exports.hr = makeHTMLElement("hr");
  exports.html = makeHTMLElement("html");
  exports.i = makeHTMLElement("i");
  exports.iframe = makeHTMLElement("iframe");
  exports.img = makeHTMLElement("img");
  exports.input = makeHTMLElement("input");
  exports.ins = makeHTMLElement("ins");
  exports.kbd = makeHTMLElement("kbd");
  exports.label = makeHTMLElement("label");
  exports.legend = makeHTMLElement("legend");
  exports.li = makeHTMLElement("li");
  exports.link = makeHTMLElement("link");
  exports.main = makeHTMLElement("main");
  exports.map = makeHTMLElement("map");
  exports.mark = makeHTMLElement("mark");
  exports.menu = makeHTMLElement("menu");
  exports.meta = makeHTMLElement("meta");
  exports.meter = makeHTMLElement("meter");
  exports.nav = makeHTMLElement("nav");
  exports.noscript = makeHTMLElement("noscript");
  exports.object = makeHTMLElement("object");
  exports.ol = makeHTMLElement("ol");
  exports.optgroup = makeHTMLElement("optgroup");
  exports.option = makeHTMLElement("option");
  exports.output = makeHTMLElement("output");
  exports.p = makeHTMLElement("p");
  exports.param = makeHTMLElement("param");
  exports.picture = makeHTMLElement("picture");
  exports.pre = makeHTMLElement("pre");
  exports.progress = makeHTMLElement("progress");
  exports.q = makeHTMLElement("q");
  exports.rp = makeHTMLElement("rp");
  exports.rt = makeHTMLElement("rt");
  exports.ruby = makeHTMLElement("ruby");
  exports.s = makeHTMLElement("s");
  exports.samp = makeHTMLElement("samp");
  exports.script = makeHTMLElement("script");
  exports.section = makeHTMLElement("section");
  exports.select = makeHTMLElement("select");
  exports.slot = makeHTMLElement("slot");
  exports.small = makeHTMLElement("small");
  exports.source = makeHTMLElement("source");
  exports.span = makeHTMLElement("span");
  exports.strong = makeHTMLElement("strong");
  exports.style = makeHTMLElement("style");
  exports.sub = makeHTMLElement("sub");
  exports.summary = makeHTMLElement("summary");
  exports.sup = makeHTMLElement("sup");
  exports.table = makeHTMLElement("table");
  exports.tbody = makeHTMLElement("tbody");
  exports.td = makeHTMLElement("td");
  exports.template = makeHTMLElement("template");
  exports.textarea = makeHTMLElement("textarea");
  exports.tfoot = makeHTMLElement("tfoot");
  exports.th = makeHTMLElement("th");
  exports.thead = makeHTMLElement("thead");
  exports.time = makeHTMLElement("time");
  exports.title = makeHTMLElement("title");
  exports.tr = makeHTMLElement("tr");
  exports.track = makeHTMLElement("track");
  exports.u = makeHTMLElement("u");
  exports.ul = makeHTMLElement("ul");
  exports.htmlvar = makeHTMLElement("var"); // var is reserved, export as variable
  exports.video = makeHTMLElement("video");
  exports.wbr = makeHTMLElement("wbr");
});
define("display", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.display = exports.isDisplay = void 0;
  const isDisplay = (a) =>
    typeof a?.toString === "function" || typeof a === "string";
  exports.isDisplay = isDisplay;
  const display = (a) => {
    if ((0, exports.isDisplay)(a)) {
      const str = a.toString();
      if (str === "[object Object]") return JSON.stringify(a);
      return str;
    }
    return JSON.stringify(a);
  };
  exports.display = display;
});
define("log", ["require", "exports", "display"], function (
  require,
  exports,
  display_js_1
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.error =
    exports.warn =
    exports.info =
    exports.debug =
    exports.DEFAULT_LOGGER =
    exports.getLogger =
    exports.LEVEL =
      void 0;
  exports.LEVEL = {
    UNKNOWN: 0,
    SILENT: 0,
    DEBUG: 1,
    VERBOSE: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
  };
  function getLogger(name) {
    const logger = { level: exports.LEVEL.INFO };
    const logAt = (level, fn) => (message, data) =>
      level >= (logger.level ?? exports.LEVEL.SILENT)
        ? fn((0, display_js_1.display)(message), data)
        : undefined;
    logger.debug = logAt(exports.LEVEL.VERBOSE, console.debug.bind(console));
    logger.info = logAt(exports.LEVEL.INFO, console.info.bind(console));
    logger.warn = logAt(exports.LEVEL.WARN, console.warn.bind(console));
    logger.error = logAt(exports.LEVEL.ERROR, console.error.bind(console));
    return logger;
  }
  exports.getLogger = getLogger;
  exports.DEFAULT_LOGGER = getLogger("default");
  function debug(message, data) {
    if (data) exports.DEFAULT_LOGGER.debug(message, data);
    else exports.DEFAULT_LOGGER.debug(message);
  }
  exports.debug = debug;
  function info(message, data) {
    if (data) exports.DEFAULT_LOGGER.info(message, data);
    else exports.DEFAULT_LOGGER.info(message);
  }
  exports.info = info;
  function warn(message, data) {
    if (data) exports.DEFAULT_LOGGER.warn(message, data);
    else exports.DEFAULT_LOGGER.warn(message);
  }
  exports.warn = warn;
  function error(message, data) {
    if (data) exports.DEFAULT_LOGGER.error(message, data);
    else exports.DEFAULT_LOGGER.error(message);
  }
  exports.error = error;
});
define("observable/observable", ["require", "exports", "log"], function (
  require,
  exports,
  log_js_1
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.operator =
    exports.tap =
    exports.takeUntil =
    exports.reduce =
    exports.replay =
    exports.map =
    exports.last =
    exports.first =
    exports.distinct =
    exports.filter =
    exports.TapOperator =
    exports.TakeUntilOperator =
    exports.watch =
    exports.EventHandler =
    exports.eventListener =
    exports.ReplaySubject =
    exports.BehaviorSubject =
    exports.Subject =
    exports.SyncScheduler =
    exports.AsyncScheduler =
    exports.Observable =
      void 0;
  exports.Observable = {
    of(...ts) {
      const subject = new Subject();
      (async function next() {
        if (subject.cold) {
          subject.onWarm(next);
          return;
        }
        if (ts.length === 0) {
          subject.complete();
          return;
        }
        const t = ts.shift();
        await subject.next(t);
        next();
      })();
      return subject;
    },
    combineLatest(o1, o2) {
      let latestSubject = new Subject();
      let o1LatestSet = false;
      let o1Latest;
      let o2LatestSet = false;
      let o2Latest;
      function next() {
        if (o1LatestSet && o2LatestSet) {
          latestSubject.next([o1Latest, o2Latest]);
        }
      }
      function error(e) {
        latestSubject.error(e);
      }
      function complete() {
        latestSubject.complete();
        o1sub.unsubscribe();
        o2sub.unsubscribe();
      }
      let o1sub = o1.subscribe({
        next(t) {
          o1Latest = t;
          o1LatestSet = true;
          next();
        },
        error,
        complete,
      });
      let o2sub = o2.subscribe({
        next(t) {
          o2Latest = t;
          o2LatestSet = true;
          next();
        },
        error,
        complete,
      });
      return latestSubject;
    },
  };
  exports.AsyncScheduler = {
    execute(fn) {
      return Promise.all(fn()).then(() => undefined);
    },
  };
  exports.SyncScheduler = {
    execute(fn) {
      fn();
    },
  };
  class Subject {
    scheduler;
    #coldWaiters = new Set();
    #subscribers = new Set();
    #complete = false;
    get $() {
      return this;
    }
    get hot() {
      return this.#subscribers.size > 0;
    }
    get cold() {
      return !this.hot;
    }
    constructor(scheduler = exports.AsyncScheduler) {
      this.scheduler = scheduler;
    }
    onWarm(fn) {
      if (this.cold) this.#coldWaiters.add(fn);
    }
    next(t) {
      if (this.#complete)
        throw new Error("Cannot call next on a completed subject");
      return this.scheduler.execute(() =>
        [...this.#subscribers].map((s) => s.next?.(t))
      );
    }
    error(e) {
      if (this.#complete)
        throw new Error("Cannot call error on a completed subject");
      return this.scheduler.execute(() =>
        [...this.#subscribers].map((s) => s.error?.(e))
      );
    }
    complete() {
      if (this.#complete)
        throw new Error("Cannot call complete on a completed subject");
      this.#complete = true;
      const finished = this.scheduler.execute(() =>
        [...this.#subscribers].map((s) => s.complete?.())
      );
      this.#subscribers.clear(); // Free subscribers for garbage collection
      return finished;
    }
    subscribe(subscriber) {
      if (this.#complete)
        throw new Error("Cannot call subscribe on a completed subject");
      if (subscriber instanceof Function) {
        subscriber = { next: subscriber };
      }
      this.#subscribers.add(subscriber);
      [...this.#coldWaiters].forEach((w) => w());
      this.#coldWaiters.clear();
      return {
        unsubscribe: () => this.#subscribers.delete(subscriber),
      };
    }
    pipe(...os) {
      this.subscribe(os[0]);
      for (let i = 1; i < os.length; i++) {
        os[i - 1].subscribe(os[i]);
      }
      return os[os.length - 1];
    }
    filter(fn) {
      return this.pipe(exports.operator.filter(fn));
    }
    distinct(fn = Object.is) {
      return this.pipe(exports.operator.distinct(fn));
    }
    map(fn) {
      return this.pipe(exports.operator.map(fn));
    }
    reduce(fn, init) {
      return this.pipe(exports.operator.reduce(fn, init));
    }
    replay(n) {
      return this.pipe(exports.operator.replay(n));
    }
    tap(s) {
      return this.pipe(exports.operator.tap(s));
    }
  }
  exports.Subject = Subject;
  class BehaviorSubject extends Subject {
    #current;
    constructor(t, scheduler) {
      super(scheduler);
      this.#current = t;
    }
    next(t) {
      this.#current = t;
      return super.next(t);
    }
    subscribe(subscriber) {
      if (subscriber instanceof Function) {
        subscriber = { next: subscriber };
      }
      subscriber.next?.(this.#current);
      return super.subscribe(subscriber);
    }
    get current() {
      return this.#current;
    }
  }
  exports.BehaviorSubject = BehaviorSubject;
  class ReplaySubject extends Subject {
    n;
    #history = [];
    constructor(n, scheduler) {
      super(scheduler);
      this.n = n;
    }
    next(t) {
      this.#history.push(t);
      if (this.#history.length > this.n) {
        this.#history.shift();
      }
      return super.next(t);
    }
    subscribe(subscriber) {
      if (subscriber instanceof Function) {
        subscriber = { next: subscriber };
      }
      const history = [...this.#history];
      (function send() {
        if (history.length == 0) return;
        const t = history.shift();
        subscriber.next?.(t);
        new Promise(send);
      })();
      return super.subscribe(subscriber);
    }
  }
  exports.ReplaySubject = ReplaySubject;
  function eventListener() {
    const observable = new Subject();
    function listener(e) {
      e.preventDefault();
      observable.next(e);
    }
    return [observable, listener];
  }
  exports.eventListener = eventListener;
  class EventHandler extends Subject {
    eventFn;
    constructor(eventFn) {
      super();
      this.eventFn = eventFn;
    }
    next(e) {
      e.preventDefault();
      super.next(e);
    }
  }
  exports.EventHandler = EventHandler;
  const watch =
    (logger = log_js_1.DEFAULT_LOGGER) =>
    (observable) => {
      observable.tap({
        next(t) {
          logger.info(t);
        },
        complete() {
          logger.info("Observable completed");
        },
        error(e) {
          logger.warn(e);
        },
      });
    };
  exports.watch = watch;
  class MapOperator extends Subject {
    mapFn;
    constructor(mapFn) {
      super();
      this.mapFn = mapFn;
    }
    next(t) {
      return super.next(this.mapFn(t));
    }
  }
  class FilterOperator extends Subject {
    filterFn;
    constructor(filterFn) {
      super();
      this.filterFn = filterFn;
    }
    next(t) {
      return this.filterFn(t) ? super.next(t) : undefined;
    }
  }
  class DistinctOperator extends Subject {
    distinctFn;
    #prior = undefined;
    constructor(distinctFn = Object.is) {
      super();
      this.distinctFn = distinctFn;
    }
    next(t) {
      if (this.#prior === undefined) {
        this.#prior = t;
        return super.next(t);
      }
      const same = this.distinctFn(this.#prior, t);
      if (!same) {
        this.#prior = t;
        return super.next(t);
      }
      return undefined;
    }
  }
  class ReduceOperator extends BehaviorSubject {
    fn;
    constructor(fn, init) {
      super(init);
      this.fn = fn;
    }
    next(t) {
      return super.next(this.fn(this.current, t));
    }
  }
  class TakeUntilOperator extends Subject {
    constructor(o) {
      super();
      o.subscribe(() => this.complete());
    }
  }
  exports.TakeUntilOperator = TakeUntilOperator;
  class TapOperator extends Subject {
    subscriber;
    constructor(fn) {
      super();
      this.subscriber = fn instanceof Function ? { next: fn } : fn;
    }
    next(t) {
      this.subscriber.next?.(t);
      return super.next(t);
    }
    error(e) {
      this.subscriber.error?.(e);
      return super.error(e);
    }
    complete() {
      this.subscriber.complete?.();
      return super.complete();
    }
  }
  exports.TapOperator = TapOperator;
  class FirstOperator extends Subject {
    next(t) {
      const next = super.next(t);
      this.complete();
      return next;
    }
  }
  class LastOperator extends Subject {
    #latest;
    next(t) {
      this.#latest = t;
    }
    complete() {
      if (this.#latest !== undefined) {
        super.next(this.#latest);
      }
      return super.complete();
    }
  }
  const filter = (fn) => new FilterOperator(fn);
  exports.filter = filter;
  const distinct = (fn) => new DistinctOperator(fn ?? Object.is);
  exports.distinct = distinct;
  const first = () => new FirstOperator();
  exports.first = first;
  const last = () => new LastOperator();
  exports.last = last;
  const map = (fn) => new MapOperator(fn);
  exports.map = map;
  const replay = (n) => new ReplaySubject(n);
  exports.replay = replay;
  const reduce = (fn, init) => new ReduceOperator(fn, init);
  exports.reduce = reduce;
  const takeUntil = (o) => new TakeUntilOperator(o);
  exports.takeUntil = takeUntil;
  const tap = (fn) => new TapOperator(fn);
  exports.tap = tap;
  exports.operator = {
    filter: exports.filter,
    distinct: exports.distinct,
    first: exports.first,
    last: exports.last,
    map: exports.map,
    replay: exports.replay,
    reduce: exports.reduce,
    takeUntil: exports.takeUntil,
    tap: exports.tap,
  };
});
define("dom/observable", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.O = void 0;
  function O(element, observable) {
    observable.subscribe((t) => {
      element.update(...t);
    });
    return element;
  }
  exports.O = O;
});
define("result", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.unwrapOrElse =
    exports.unwrapOr =
    exports.unwrap =
    exports.Err =
    exports.Ok =
    exports.isResult =
    exports.isErr =
    exports.isOk =
    exports.Some =
    exports.None =
    exports.isSome =
    exports.isNone =
      void 0;
  const isNone = (s) => s === null;
  exports.isNone = isNone;
  const isSome = (s) => s != null;
  exports.isSome = isSome;
  function None(_) {
    return null;
  }
  exports.None = None;
  function Some(t) {
    return t;
  }
  exports.Some = Some;
  const isOk = (t) => t.ok !== undefined;
  exports.isOk = isOk;
  const isErr = (e) => e.err !== undefined;
  exports.isErr = isErr;
  const isResult = (t) => (0, exports.isOk)(t) || (0, exports.isErr)(t);
  exports.isResult = isResult;
  function Ok(t) {
    return t.ok
      ? t.ok
      : {
          ok: t,
          map(fn) {
            return fn(Ok(this));
          },
        };
  }
  exports.Ok = Ok;
  function Err(e) {
    return (
      e.err ?? {
        err: e,
        map(_fn) {
          return this;
        },
      }
    );
  }
  exports.Err = Err;
  function unwrap(t) {
    if ((0, exports.isNone)(t)) {
      throw new Error(`Attempted to unwrap None`);
    }
    if ((0, exports.isErr)(t)) {
      throw Err(t);
    }
    if ((0, exports.isOk)(t)) {
      return Ok(t);
    }
    return t;
  }
  exports.unwrap = unwrap;
  function unwrapOr(t, def) {
    if ((0, exports.isNone)(t)) {
      return def;
    }
    if ((0, exports.isErr)(t)) {
      return def;
    }
    if ((0, exports.isOk)(t)) {
      return Ok(t);
    }
    return t;
  }
  exports.unwrapOr = unwrapOr;
  function unwrapOrElse(t, def) {
    if ((0, exports.isNone)(t)) {
      return def();
    }
    if ((0, exports.isErr)(t)) {
      return def();
    }
    if ((0, exports.isOk)(t)) {
      return Ok(t);
    }
    return t;
  }
  exports.unwrapOrElse = unwrapOrElse;
});
define("dom/provide", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.retrieve = exports.provide = void 0;
  let registry = {};
  function provide(items) {
    registry = { ...registry, ...items };
  }
  exports.provide = provide;
  function retrieve(key) {
    return registry[key];
  }
  exports.retrieve = retrieve;
});
define("dom/svg", ["require", "exports", "dom/dom"], function (
  require,
  exports,
  dom_js_3
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.view =
    exports.use =
    exports.tspan =
    exports.title =
    exports.textPath =
    exports.text =
    exports.symbol =
    exports.svgswitch =
    exports.svg =
    exports.style =
    exports.stop =
    exports.set =
    exports.script =
    exports.rect =
    exports.radialGradient =
    exports.polyline =
    exports.polygon =
    exports.pattern =
    exports.path =
    exports.mpath =
    exports.metadata =
    exports.mask =
    exports.marker =
    exports.linearGradient =
    exports.line =
    exports.image =
    exports.g =
    exports.foreignObject =
    exports.filter =
    exports.feTurbulence =
    exports.feTile =
    exports.feSpotLight =
    exports.feSpecularLighting =
    exports.fePointLight =
    exports.feOffset =
    exports.feMorphology =
    exports.feMergeNode =
    exports.feMerge =
    exports.feImage =
    exports.feGaussianBlur =
    exports.feFuncR =
    exports.feFuncG =
    exports.feFuncB =
    exports.feFuncA =
    exports.feFlood =
    exports.feDropShadow =
    exports.feDistantLight =
    exports.feDisplacementMap =
    exports.feDiffuseLighting =
    exports.feConvolveMatrix =
    exports.feComposite =
    exports.feComponentTransfer =
    exports.feColorMatrix =
    exports.feBlend =
    exports.ellipse =
    exports.desc =
    exports.defs =
    exports.clipPath =
    exports.circle =
    exports.animateTransform =
    exports.animateMotion =
    exports.animate =
    exports.a =
      void 0;
  const makeSVGElement =
    (name) =>
    (attrs, ...children) =>
      (0, dom_js_3.up)(
        document.createElementNS("http://www.w3.org/2000/svg", name),
        attrs,
        ...children
      );
  exports.a = makeSVGElement("a");
  exports.animate = makeSVGElement("animate");
  exports.animateMotion = makeSVGElement("animateMotion");
  exports.animateTransform = makeSVGElement("animateTransform");
  exports.circle = makeSVGElement("circle");
  exports.clipPath = makeSVGElement("clipPath");
  exports.defs = makeSVGElement("defs");
  exports.desc = makeSVGElement("desc");
  exports.ellipse = makeSVGElement("ellipse");
  exports.feBlend = makeSVGElement("feBlend");
  exports.feColorMatrix = makeSVGElement("feColorMatrix");
  exports.feComponentTransfer = makeSVGElement("feComponentTransfer");
  exports.feComposite = makeSVGElement("feComposite");
  exports.feConvolveMatrix = makeSVGElement("feConvolveMatrix");
  exports.feDiffuseLighting = makeSVGElement("feDiffuseLighting");
  exports.feDisplacementMap = makeSVGElement("feDisplacementMap");
  exports.feDistantLight = makeSVGElement("feDistantLight");
  exports.feDropShadow = makeSVGElement("feDropShadow");
  exports.feFlood = makeSVGElement("feFlood");
  exports.feFuncA = makeSVGElement("feFuncA");
  exports.feFuncB = makeSVGElement("feFuncB");
  exports.feFuncG = makeSVGElement("feFuncG");
  exports.feFuncR = makeSVGElement("feFuncR");
  exports.feGaussianBlur = makeSVGElement("feGaussianBlur");
  exports.feImage = makeSVGElement("feImage");
  exports.feMerge = makeSVGElement("feMerge");
  exports.feMergeNode = makeSVGElement("feMergeNode");
  exports.feMorphology = makeSVGElement("feMorphology");
  exports.feOffset = makeSVGElement("feOffset");
  exports.fePointLight = makeSVGElement("fePointLight");
  exports.feSpecularLighting = makeSVGElement("feSpecularLighting");
  exports.feSpotLight = makeSVGElement("feSpotLight");
  exports.feTile = makeSVGElement("feTile");
  exports.feTurbulence = makeSVGElement("feTurbulence");
  exports.filter = makeSVGElement("filter");
  exports.foreignObject = makeSVGElement("foreignObject");
  exports.g = makeSVGElement("g");
  exports.image = makeSVGElement("image");
  exports.line = makeSVGElement("line");
  exports.linearGradient = makeSVGElement("linearGradient");
  exports.marker = makeSVGElement("marker");
  exports.mask = makeSVGElement("mask");
  exports.metadata = makeSVGElement("metadata");
  exports.mpath = makeSVGElement("mpath");
  exports.path = makeSVGElement("path");
  exports.pattern = makeSVGElement("pattern");
  exports.polygon = makeSVGElement("polygon");
  exports.polyline = makeSVGElement("polyline");
  exports.radialGradient = makeSVGElement("radialGradient");
  exports.rect = makeSVGElement("rect");
  exports.script = makeSVGElement("script");
  exports.set = makeSVGElement("set");
  exports.stop = makeSVGElement("stop");
  exports.style = makeSVGElement("style");
  exports.svg = makeSVGElement("svg");
  exports.svgswitch = makeSVGElement("switch");
  exports.symbol = makeSVGElement("symbol");
  exports.text = makeSVGElement("text");
  exports.textPath = makeSVGElement("textPath");
  exports.title = makeSVGElement("title");
  exports.tspan = makeSVGElement("tspan");
  exports.use = makeSVGElement("use");
  exports.view = makeSVGElement("view");
});
define("dom/xml", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.xml = void 0;
  function xml(tag, attributes, children = []) {
    const attrs = Object.entries(attributes).reduce(
      (attrs, [attr, val]) => `${attrs} ${attr}="${val}"`,
      ""
    );
    return `<${tag} ${attrs}>${children.join("")}</${tag}>`;
  }
  exports.xml = xml;
});
define("dom/index", [
  "require",
  "exports",
  "dom/dom",
  "dom/fc",
  "dom/html",
  "dom/observable",
  "dom/provide",
  "dom/svg",
  "dom/xml",
], function (require, exports, dom_1, fc, html, observable, provide, svg, xml) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.xml =
    exports.svg =
    exports.provide =
    exports.observable =
    exports.html =
    exports.fc =
      void 0;
  __exportStar(dom_1, exports);
  exports.fc = fc;
  exports.html = html;
  exports.observable = observable;
  exports.provide = provide;
  exports.svg = svg;
  exports.xml = xml;
});
define("assert", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.checkExhaustive =
    exports.assertString =
    exports.assertExists =
    exports.assert =
      void 0;
  /**
   * Throw an error when a condition is not met.
   */
  function assert(condition, message = "Assertion failed") {
    if (!condition) {
      throw new Error(message instanceof Function ? message() : message);
    }
  }
  exports.assert = assert;
  /**
   * Given a value, return it if it is not null nor undefined. Otherwise throw an
   * error.
   *
   * @template T
   * @returns {NonNullable<T>}
   */
  function assertExists(t, message = "Assertion failed: value does not exist") {
    assert(t != null, message);
    return t;
  }
  exports.assertExists = assertExists;
  /**
   * @param {*} n
   * @returns string
   */
  function assertString(
    n,
    message = () => `Assertion failed: ${n} is not a string`
  ) {
    assert(typeof n === "string", message);
    return n;
  }
  exports.assertString = assertString;
  /**
   * Compile time assertion that no value will used at this point in control flow.
   */
  function checkExhaustive(value, message = `Unexpected value ${value}`) {
    throw new Error(message instanceof Function ? message() : message);
  }
  exports.checkExhaustive = checkExhaustive;
});
define("context", ["require", "exports", "result"], function (
  require,
  exports,
  result_js_1
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.asyncUsing = exports.using = exports.Exit = exports.Enter = void 0;
  exports.Enter = Symbol("Context Enter");
  exports.Exit = Symbol("Context Exit");
  function using(
    context,
    operation,
    normalizeError = (e) => (0, result_js_1.Err)(e)
  ) {
    if (typeof context === "function") {
      if (context.length === 1) {
        operation = context;
        context = {};
      } else {
        context = context();
      }
    }
    let result;
    try {
      context[exports.Enter]();
      const op = operation(context);
      result = (0, result_js_1.isResult)(op) ? op : (0, result_js_1.Ok)(op);
    } catch (e) {
      result = normalizeError(e);
    } finally {
      context[exports.Exit]();
    }
    return result;
  }
  exports.using = using;
  async function asyncUsing(
    context,
    operation,
    normalizeError = (e) => (0, result_js_1.Err)(e)
  ) {
    context = typeof context === "function" ? await context() : context;
    let result;
    try {
      context[exports.Enter]();
      const op = await operation(context);
      result = (0, result_js_1.isResult)(op) ? op : (0, result_js_1.Ok)(op);
    } catch (e) {
      result = normalizeError(e);
    } finally {
      context[exports.Exit]();
    }
    return result;
  }
  exports.asyncUsing = asyncUsing;
});
define("debounce", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.debounce = void 0;
  function debounce(fn, ms = 32) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => (clearTimeout(timer), fn(...args)), ms);
      return timer;
    };
  }
  exports.debounce = debounce;
});
define("flags", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.parse = void 0;
  const parse = (parseArgs) => {
    const fromNode = parseArgs[0].endsWith("node");
    const argv = parseArgs[fromNode ? 1 : 0];
    const params = new Map();
    const flags = new Map();
    const args = [];
    let index = fromNode ? 2 : 1;
    const hasNext = () => index < parseArgs.length;
    const peek = () => parseArgs[index];
    const advance = () => parseArgs[index++];
    const parseLong = (arg) => {
      if (arg.substr(0, 3) === "no-") {
        flags.set(arg.substr(3), false);
      } else if (!arg.includes("=")) {
        flags.set(arg, true);
      } else {
        const [param, ...value] = arg.split("=");
        params.set(param, value.join("="));
      }
    };
    while (hasNext()) {
      if (peek().substr(0, 2) === "--") {
        parseLong(advance().substr(2));
      } else {
        args.push(advance());
      }
    }
    return {
      get argv0() {
        return argv;
      },
      get args() {
        return args;
      },
      get(flag, def = false) {
        return flags.get(flag) ?? def;
      },
      asNumber(param, def = 0) {
        return Number.parseFloat(params.get(param) ?? `${def}`);
      },
      asString(param, def = "") {
        return params.get(param) ?? def;
      },
    };
  };
  exports.parse = parse;
});
define("fs", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.reset =
    exports.ObjectFileSystemAdapter =
    exports.LocalStorageFileSystemAdapter =
    exports.RecordFileSystemAdapter =
    exports.FileSystem =
    exports.basename =
      void 0;
  function basename(filename) {
    const end = filename.lastIndexOf("/");
    const basename = filename.substring(end === -1 ? 0 : end);
    return basename;
  }
  exports.basename = basename;
  function join(...paths) {
    const pathParts = [];
    for (const path of paths) {
      for (const part of path.split("/")) {
        switch (part) {
          case "":
          case ".":
            break;
          case "..":
            pathParts.pop();
            break;
          default:
            pathParts.push(part);
        }
      }
    }
    return "/" + pathParts.join("/");
  }
  class FileSystem {
    adapter;
    wd = "/";
    stack = [];
    constructor(adapter = new RecordFileSystemAdapter()) {
      this.adapter = adapter;
    }
    cwd() {
      return this.wd;
    }
    cd(dir) {
      this.wd = this.p(dir);
    }
    pushd(dir) {
      this.stack.push(this.wd);
      this.cd(dir);
    }
    popd() {
      if (this.stack.length > 0) {
        this.wd = this.stack.pop();
      }
    }
    stat(path) {
      return this.adapter.stat(join(this.cwd(), path));
    }
    scandir(path) {
      return this.adapter.scandir(this.cwd());
    }
    readdir(path) {
      return this.adapter.readdir(path);
    }
    copyFile(from, to) {
      return this.adapter.copyFile(this.p(from), this.p(to));
    }
    readFile(path) {
      return this.adapter.readFile(this.p(path));
    }
    writeFile(path, contents) {
      return this.adapter.writeFile(this.p(path), contents);
    }
    rm(path) {
      return this.adapter.rm(this.p(path));
    }
    p(path) {
      return path[0] === "/" ? path : join(this.cwd(), path);
    }
  }
  exports.FileSystem = FileSystem;
  class RecordFileSystemAdapter {
    fs;
    constructor(fs = {}) {
      this.fs = fs;
    }
    stat(path) {
      return new Promise((resolve, reject) => {
        if (this.fs[path] != null) {
          resolve({
            name: basename(path),
            isDirectory() {
              return false;
            },
            isFile() {
              return true;
            },
          });
        } else {
          reject();
        }
      });
    }
    async scandir(path) {
      return (await this.readdir(path)).map((name) => {
        let isFile = this.fs[join(path, name)] !== undefined;
        return {
          name,
          isDirectory() {
            return !isFile;
          },
          isFile() {
            return isFile;
          },
        };
      });
    }
    readdir(path) {
      if (!path.endsWith("/")) path += "/";
      return new Promise((resolve) => {
        let dir = new Set();
        for (const filename of Object.keys(this.fs)) {
          if (filename.startsWith(path)) {
            const end = filename.indexOf("/", path.length + 1);
            const basename = filename.substring(
              path.length,
              end === -1 ? undefined : end
            );
            dir.add(basename);
          }
        }
        return resolve([...dir].sort());
      });
    }
    copyFile(from, to) {
      return new Promise((resolve) => {
        this.fs[to] = this.fs[from];
        resolve();
      });
    }
    readFile(path) {
      return new Promise((resolve, reject) => {
        let file = this.fs[path];
        if (file === undefined) {
          const error = new Error(`File Not Found ${path}`);
          reject(error);
        } else {
          resolve(file);
        }
      });
    }
    writeFile(path, contents) {
      return new Promise((resolve) => {
        this.fs[path] = contents;
        resolve();
      });
    }
    rm(path) {
      return new Promise((resolve) => {
        delete this.fs[path];
        resolve();
      });
    }
  }
  exports.RecordFileSystemAdapter = RecordFileSystemAdapter;
  class LocalStorageFileSystemAdapter extends RecordFileSystemAdapter {
    constructor() {
      super(window.localStorage);
    }
  }
  exports.LocalStorageFileSystemAdapter = LocalStorageFileSystemAdapter;
  class ObjectFileSystemAdapter extends RecordFileSystemAdapter {}
  exports.ObjectFileSystemAdapter = ObjectFileSystemAdapter;
  async function reset(fs, tree) {
    for (const [path, file] of Object.entries(tree)) {
      if (typeof file === "string") {
        await fs.writeFile(path, file);
      } else {
        fs.cd(path);
        await reset(fs, file);
        fs.cd("..");
      }
    }
  }
  exports.reset = reset;
});
define("generator", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.takeWhile = void 0;
  function* takeWhile(predicate, iterator) {
    for (const x of iterator) {
      if (predicate(x)) {
        yield x;
      } else {
        return;
      }
    }
  }
  exports.takeWhile = takeWhile;
});
define("lock", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.lock = void 0;
  const locks = new WeakSet();
  function lock(fn) {
    return function (...args) {
      let ret = null;
      let ex = null;
      if (!locks.has(fn)) {
        locks.add(fn);
        try {
          ret = fn(...args);
        } catch (e) {
          ex = e;
        }
      }
      locks.delete(fn);
      if (ex !== null) {
        throw ex;
      } else {
        return ret;
      }
    };
  }
  exports.lock = lock;
});
define("range", ["require", "exports"], function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.range = void 0;
  function range(start, end, stride = 1) {
    const range = [];
    for (let i = start; i < end; i += stride) {
      range.push(i);
    }
    return range;
  }
  exports.range = range;
});
define("jiffies", [
  "require",
  "exports",
  "dom/index",
  "assert",
  "context",
  "debounce",
  "display",
  "flags",
  "fs",
  "generator",
  "lock",
  "log",
  "range",
  "result",
], function (
  require,
  exports,
  dom,
  assert,
  context,
  debounce,
  display,
  flags,
  fs,
  generator,
  lock,
  log,
  range,
  result
) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.result =
    exports.range =
    exports.log =
    exports.lock =
    exports.generator =
    exports.fs =
    exports.flags =
    exports.display =
    exports.debounce =
    exports.context =
    exports.assert =
    exports.dom =
      void 0;
  exports.dom = dom;
  exports.assert = assert;
  exports.context = context;
  exports.debounce = debounce;
  exports.display = display;
  exports.flags = flags;
  exports.fs = fs;
  exports.generator = generator;
  // export * as is_browser from "./is_browser";
  exports.lock = lock;
  exports.log = log;
  exports.range = range;
  exports.result = result;
});
//# sourceMappingURL=jiffies.js.map
