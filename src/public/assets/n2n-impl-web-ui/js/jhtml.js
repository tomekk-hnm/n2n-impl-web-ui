var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Jhtml;
(function (Jhtml) {
    function ready(callback, document) {
        return getOrCreateContext().onReady(callback);
    }
    Jhtml.ready = ready;
    var browser = null;
    var monitor = null;
    function getOrCreateBrowser() {
        if (browser)
            return browser;
        var context = getOrCreateContext();
        if (!context.isJhtml())
            return null;
        monitor = Jhtml.Monitor.from(context.document.documentElement);
        browser = new Jhtml.Browser(window, monitor.history);
        return browser;
    }
    Jhtml.getOrCreateBrowser = getOrCreateBrowser;
    function getOrCreateMonitor() {
        getOrCreateBrowser();
        return monitor;
    }
    Jhtml.getOrCreateMonitor = getOrCreateMonitor;
    function getOrCreateContext(document) {
        return Jhtml.Context.from(document || window.document);
    }
    Jhtml.getOrCreateContext = getOrCreateContext;
    function lookupModel(url) {
        getOrCreateBrowser();
        return monitor.lookupModel(Jhtml.Url.create(url));
    }
    Jhtml.lookupModel = lookupModel;
    window.document.addEventListener("DOMContentLoaded", function () {
        getOrCreateBrowser();
    }, false);
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Browser = (function () {
        function Browser(window, _history) {
            var _this = this;
            this.window = window;
            this._history = _history;
            _history.push(new Jhtml.Page(Jhtml.Url.create(window.location.href), null));
            _history.onPush(function (entry) {
                _this.onPush(entry);
            });
            _history.onChanged(function () {
                _this.onChanged();
            });
            this.window.addEventListener("popstate", function (evt) { return _this.onPopstate(evt); });
        }
        Object.defineProperty(Browser.prototype, "history", {
            get: function () {
                return this._history;
            },
            enumerable: true,
            configurable: true
        });
        Browser.prototype.onPopstate = function (evt) {
            var url = Jhtml.Url.create(this.window.location.href);
            var index = 0;
            if (this.window.history.state && this.window.history.state.historyIndex) {
                index = this.window.history.state.historyIndex;
            }
            try {
                this.history.go(index, url);
            }
            catch (e) {
                this.window.location.href = url.toString();
            }
        };
        Browser.prototype.onChanged = function () {
            var entry = this.history.currentEntry;
            if (entry.browserHistoryIndex !== undefined) {
                this.window.history.go(entry.browserHistoryIndex);
                return;
            }
            this.window.location.href = entry.page.url.toString();
        };
        Browser.prototype.onPush = function (entry) {
            entry.browserHistoryIndex = this.window.history.length;
            var urlStr = entry.page.url.toString();
            var stateObj = {
                "url": urlStr,
                "historyIndex": entry.index
            };
            this.window.history.pushState(stateObj, "Page", urlStr);
        };
        return Browser;
    }());
    Jhtml.Browser = Browser;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var History = (function () {
        function History() {
            this._entries = [];
            this.changedCbr = new Jhtml.Util.CallbackRegistry();
            this.pushCbr = new Jhtml.Util.CallbackRegistry();
        }
        Object.defineProperty(History.prototype, "currentEntry", {
            get: function () {
                if (this._entries[this._currentIndex]) {
                    return this._entries[this._currentIndex];
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(History.prototype, "currentPage", {
            get: function () {
                var entry;
                if (entry = this.currentEntry) {
                    return entry.page;
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        History.prototype.getPageByUrl = function (url) {
            for (var _i = 0, _a = this._entries; _i < _a.length; _i++) {
                var entry = _a[_i];
                if (!entry.page.url.equals(url))
                    continue;
                return entry.page;
            }
            return null;
        };
        History.prototype.onChanged = function (callback) {
            this.changedCbr.on(callback);
        };
        History.prototype.offChanged = function (callback) {
            this.changedCbr.off(callback);
        };
        History.prototype.onPush = function (callback) {
            this.pushCbr.on(callback);
        };
        History.prototype.offPush = function (callback) {
            this.pushCbr.off(callback);
        };
        History.prototype.go = function (index, checkUrl) {
            if (!this._entries[index]) {
                throw new Error("Unknown history entry index " + index + ". Check url: " + checkUrl);
            }
            if (checkUrl && !this._entries[index].page.url.equals(checkUrl)) {
                throw new Error("Check url does not match with page of history entry index " + index + " dow: "
                    + checkUrl + " != " + this._entries[index].page.url);
            }
            if (this._currentIndex == index)
                return;
            this._currentIndex = index;
            this.changedCbr.fire();
        };
        History.prototype.push = function (page) {
            var sPage = this.getPageByUrl(page.url);
            if (sPage && sPage !== page) {
                throw new Error("Page with same url already registered.");
            }
            var nextI = this._currentIndex + 1;
            for (var i = nextI; i < this._entries.length; i++) {
                this._entries[i].page.dispose();
            }
            this._entries.splice(nextI);
            this._currentIndex = this._entries.length;
            var entry = new History.Entry(this._currentIndex, page);
            this._entries.push(entry);
            this.pushCbr.fire(entry);
            this.changedCbr.fire();
        };
        return History;
    }());
    Jhtml.History = History;
    (function (History) {
        var Entry = (function () {
            function Entry(_index, _page) {
                this._index = _index;
                this._page = _page;
            }
            Object.defineProperty(Entry.prototype, "index", {
                get: function () {
                    return this._index;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Entry.prototype, "page", {
                get: function () {
                    return this._page;
                },
                enumerable: true,
                configurable: true
            });
            return Entry;
        }());
        History.Entry = Entry;
    })(History = Jhtml.History || (Jhtml.History = {}));
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Page = (function () {
        function Page(_url, promise) {
            var _this = this;
            this._url = _url;
            this.promise = promise;
            this._loaded = false;
            if (promise) {
                promise.then(function () {
                    _this._loaded = true;
                });
            }
        }
        Object.defineProperty(Page.prototype, "loaded", {
            get: function () {
                return this._loaded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "url", {
            get: function () {
                return this._url;
            },
            enumerable: true,
            configurable: true
        });
        Page.prototype.dispose = function () {
            this.promise = null;
        };
        Object.defineProperty(Page.prototype, "disposed", {
            get: function () {
                return this.promise ? false : true;
            },
            enumerable: true,
            configurable: true
        });
        return Page;
    }());
    Jhtml.Page = Page;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Context = (function () {
        function Context(_document) {
            var _this = this;
            this._document = _document;
            this.compHandlers = {};
            this.readyCbr = new Jhtml.Util.CallbackRegistry();
            this.readyBound = false;
            this.loadObservers = [];
            this._requestor = new Jhtml.Requestor(this);
            this._document.addEventListener("DOMContentLoaded", function () {
                _this.readyCbr.fire([_this.document.documentElement], {});
            }, false);
        }
        Object.defineProperty(Context.prototype, "requestor", {
            get: function () {
                return this._requestor;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Context.prototype, "document", {
            get: function () {
                return this._document;
            },
            enumerable: true,
            configurable: true
        });
        Context.prototype.isJhtml = function () {
            return this.getModelState(false) ? true : false;
        };
        Context.prototype.getModelState = function (required) {
            if (!this.modelState) {
                try {
                    this.modelState = Jhtml.ModelFactory.createStateFromDocument(this.document);
                    Jhtml.Ui.Scanner.scan(this.document.documentElement);
                }
                catch (e) {
                    if (e instanceof Jhtml.ParseError)
                        return null;
                    throw e;
                }
            }
            if (!this.modelState && required) {
                throw new Error("No jhtml context");
            }
            return this.modelState || null;
        };
        Context.prototype.import = function (newModel, montiorCompHandlers) {
            if (montiorCompHandlers === void 0) { montiorCompHandlers = {}; }
            var boundModelState = this.getModelState(true);
            for (var name_1 in boundModelState.comps) {
                var comp = boundModelState.comps[name_1];
                if (!(montiorCompHandlers[name_1] && montiorCompHandlers[name_1].detachComp(comp))
                    && !(this.compHandlers[name_1] && this.compHandlers[name_1].detachComp(comp))) {
                    comp.detach();
                }
            }
            boundModelState.container.detach();
            var loadObserver = boundModelState.metaState.replaceWith(newModel.meta);
            this.registerLoadObserver(loadObserver);
            if (!boundModelState.container.matches(newModel.container)) {
                boundModelState.container = newModel.container;
            }
            boundModelState.container.attachTo(boundModelState.metaState.containerElement, loadObserver);
            for (var name_2 in newModel.comps) {
                var comp = boundModelState.comps[name_2] = newModel.comps[name_2];
                if (!(montiorCompHandlers[name_2] && montiorCompHandlers[name_2].attachComp(comp, loadObserver))
                    && !(this.compHandlers[name_2] && this.compHandlers[name_2].attachComp(comp, loadObserver))) {
                    comp.attachTo(boundModelState.container.compElements[name_2], loadObserver);
                }
            }
        };
        Context.prototype.importMeta = function (meta) {
            var boundModelState = this.getModelState(true);
            var loadObserver = boundModelState.metaState.import(meta);
            this.registerLoadObserver(loadObserver);
            return loadObserver;
        };
        Context.prototype.registerLoadObserver = function (loadObserver) {
            var _this = this;
            this.loadObservers.push(loadObserver);
            loadObserver.whenLoaded(function () {
                _this.loadObservers.splice(_this.loadObservers.indexOf(loadObserver), 1);
            });
        };
        Context.prototype.registerNewModel = function (model) {
            var _this = this;
            var container = model.container;
            if (container) {
                var containerReadyCallback_1 = function () {
                    container.off("attached", containerReadyCallback_1);
                    container.loadObserver.whenLoaded(function () {
                        _this.readyCbr.fire(container.elements, { container: container });
                        Jhtml.Ui.Scanner.scanArray(container.elements);
                    });
                };
                container.on("attached", containerReadyCallback_1);
            }
            var _loop_1 = function (comp) {
                var compReadyCallback = function () {
                    comp.off("attached", compReadyCallback);
                    comp.loadObserver.whenLoaded(function () {
                        _this.readyCbr.fire(comp.elements, { comp: Jhtml.Comp });
                        Jhtml.Ui.Scanner.scanArray(comp.elements);
                    });
                };
                comp.on("attached", compReadyCallback);
            };
            for (var _i = 0, _a = Object.values(model.comps); _i < _a.length; _i++) {
                var comp = _a[_i];
                _loop_1(comp);
            }
            var snippet = model.snippet;
            if (snippet) {
                var snippetReadyCallback_1 = function () {
                    snippet.off("attached", snippetReadyCallback_1);
                    _this.importMeta(model.meta).whenLoaded(function () {
                        _this.readyCbr.fire(snippet.elements, { snippet: snippet });
                        Jhtml.Ui.Scanner.scanArray(snippet.elements);
                    });
                };
                snippet.on("attached", snippetReadyCallback_1);
            }
        };
        Context.prototype.replace = function (text, mimeType, replace) {
            this.document.open(mimeType, replace ? "replace" : null);
            this.document.write(text);
            this.document.close();
        };
        Context.prototype.registerCompHandler = function (compName, compHandler) {
            this.compHandlers[compName] = compHandler;
        };
        Context.prototype.unregisterCompHandler = function (compName) {
            delete this.compHandlers[compName];
        };
        Context.prototype.onReady = function (readyCallback) {
            this.readyCbr.on(readyCallback);
            if ((this._document.readyState === "complete" || this._document.readyState === "interactive")
                && this.loadObservers.length == 0) {
                readyCallback([this.document.documentElement], {});
            }
        };
        Context.prototype.offReady = function (readyCallback) {
            this.readyCbr.off(readyCallback);
        };
        Context.test = function (document) {
            var context = Jhtml.Util.getElemData(document.documentElement, Context.KEY);
            if (context instanceof Context) {
                return context;
            }
            return null;
        };
        Context.from = function (document) {
            var context = Context.test(document);
            if (context)
                return context;
            Jhtml.Util.bindElemData(document.documentElement, Context.KEY, context = new Context(document));
            return context;
        };
        Context.KEY = "data-jhtml-context";
        return Context;
    }());
    Jhtml.Context = Context;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Meta = (function () {
        function Meta() {
            this.headElements = [];
            this.bodyElements = [];
            this.containerElement = null;
        }
        return Meta;
    }());
    Jhtml.Meta = Meta;
    var MetaState = (function () {
        function MetaState(rootElem, headElem, bodyElem, containerElem) {
            this.rootElem = rootElem;
            this.headElem = headElem;
            this.bodyElem = bodyElem;
            this.containerElem = containerElem;
        }
        Object.defineProperty(MetaState.prototype, "headElements", {
            get: function () {
                return Jhtml.Util.array(this.headElem.children);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MetaState.prototype, "bodyElements", {
            get: function () {
                return Jhtml.Util.array(this.bodyElem.children);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MetaState.prototype, "containerElement", {
            get: function () {
                return this.containerElem;
            },
            enumerable: true,
            configurable: true
        });
        MetaState.prototype.import = function (newMeta) {
            this.processedElements = [];
            this.removableElems = [];
            this.newMeta = newMeta;
            var loadObserver = this.loadObserver = new LoadObserver();
            this.mergeInto(newMeta.headElements, this.headElem, Meta.Target.HEAD);
            this.mergeInto(newMeta.bodyElements, this.headElem, Meta.Target.BODY);
            this.processedElements = null;
            this.removableElems = null;
            this.newMeta = null;
            this.loadObserver = null;
            return loadObserver;
        };
        MetaState.prototype.replaceWith = function (newMeta) {
            this.processedElements = [];
            this.removableElems = [];
            this.newMeta = newMeta;
            var loadObserver = this.loadObserver = new LoadObserver();
            this.mergeInto(newMeta.headElements, this.headElem, Meta.Target.HEAD);
            this.mergeInto(newMeta.bodyElements, this.headElem, Meta.Target.BODY);
            for (var _i = 0, _a = this.removableElems; _i < _a.length; _i++) {
                var removableElem = _a[_i];
                if (this.containsProcessed(removableElem))
                    continue;
                removableElem.remove();
            }
            this.processedElements = null;
            this.removableElems = null;
            this.newMeta = null;
            this.loadObserver = null;
            return loadObserver;
        };
        MetaState.prototype.mergeInto = function (newElems, parentElem, target) {
            var mergedElems = [];
            var curElems = Jhtml.Util.array(parentElem.children);
            for (var i in newElems) {
                var newElem = newElems[i];
                var mergedElem = this.mergeElem(curElems, newElem, target);
                if (mergedElem === this.containerElem)
                    continue;
                this.mergeInto(Jhtml.Util.array(newElem.children), mergedElem, target);
                mergedElems.push(mergedElem);
            }
            for (var i = 0; i < curElems.length; i++) {
                if (-1 < mergedElems.indexOf(curElems[i]))
                    continue;
                this.removableElems.push(curElems[i]);
                curElems.splice(i, 1);
            }
            var curElem = curElems.shift();
            for (var i = 0; i < mergedElems.length; i++) {
                var mergedElem = mergedElems[i];
                if (mergedElem === curElem) {
                    curElem = curElems.shift();
                    continue;
                }
                this.loadObserver.addElement(mergedElem);
                if (!curElem) {
                    parentElem.appendChild(mergedElem);
                    continue;
                }
                parentElem.insertBefore(mergedElem, curElem);
                var j = void 0;
                if (-1 < (j = curElems.indexOf(mergedElem))) {
                    curElems.splice(j, 1);
                }
            }
        };
        MetaState.prototype.mergeElem = function (preferedElems, newElem, target) {
            if (newElem === this.newMeta.containerElement) {
                if (!this.compareExact(this.containerElem, newElem, false)) {
                    var mergedElem_1 = newElem.cloneNode(false);
                    this.processedElements.push(mergedElem_1);
                    return mergedElem_1;
                }
                this.processedElements.push(this.containerElem);
                return this.containerElem;
            }
            if (newElem.contains(this.newMeta.containerElement)) {
                var mergedElem_2;
                if (mergedElem_2 = this.filterExact(preferedElems, newElem, false)) {
                    this.processedElements.push(mergedElem_2);
                    return mergedElem_2;
                }
                return this.cloneNewElem(newElem, false);
            }
            var mergedElem;
            switch (newElem.tagName) {
                case "SCRIPT":
                    if ((mergedElem = this.filter(preferedElems, newElem, ["src", "type"], true, false))
                        || (mergedElem = this.find(newElem, ["src", "type"], true, false))) {
                        this.processedElements.push(mergedElem);
                        return mergedElem;
                    }
                    return this.cloneNewElem(newElem, true);
                case "STYLE":
                case "LINK":
                    if ((mergedElem = this.filterExact(preferedElems, newElem, true))
                        || (mergedElem = this.findExact(newElem, true))) {
                        this.processedElements.push(mergedElem);
                        return mergedElem;
                    }
                    return this.cloneNewElem(newElem, true);
                default:
                    if ((mergedElem = this.filterExact(preferedElems, newElem, true))
                        || (mergedElem = this.findExact(newElem, true, target))) {
                        this.processedElements.push(mergedElem);
                        return mergedElem;
                    }
                    return this.cloneNewElem(newElem, false);
            }
        };
        MetaState.prototype.cloneNewElem = function (newElem, deep) {
            var mergedElem = this.rootElem.ownerDocument.createElement(newElem.tagName);
            for (var _i = 0, _a = this.attrNames(newElem); _i < _a.length; _i++) {
                var name_3 = _a[_i];
                mergedElem.setAttribute(name_3, newElem.getAttribute(name_3));
            }
            if (deep) {
                mergedElem.innerHTML = newElem.innerHTML;
            }
            this.processedElements.push(mergedElem);
            return mergedElem;
        };
        MetaState.prototype.attrNames = function (elem) {
            var attrNames = [];
            var attrs = elem.attributes;
            for (var i = 0; i < attrs.length; i++) {
                attrNames.push(attrs[i].nodeName);
            }
            return attrNames;
        };
        MetaState.prototype.findExact = function (matchingElem, checkInner, target) {
            if (target === void 0) { target = Meta.Target.HEAD | Meta.Target.BODY; }
            return this.find(matchingElem, this.attrNames(matchingElem), checkInner, true, target);
        };
        MetaState.prototype.find = function (matchingElem, matchingAttrNames, checkInner, checkAttrNum, target) {
            if (target === void 0) { target = Meta.Target.HEAD | Meta.Target.BODY; }
            var foundElem = null;
            if ((target & Meta.Target.HEAD)
                && (foundElem = this.findIn(this.headElem, matchingElem, matchingAttrNames, checkInner, checkAttrNum))) {
                return foundElem;
            }
            if ((target & Meta.Target.BODY)
                && (foundElem = this.findIn(this.bodyElem, matchingElem, matchingAttrNames, checkInner, checkAttrNum))) {
                return foundElem;
            }
            return null;
        };
        MetaState.prototype.findIn = function (nodeSelector, matchingElem, matchingAttrNames, checkInner, chekAttrNum) {
            for (var _i = 0, _a = Jhtml.Util.find(nodeSelector, matchingElem.tagName); _i < _a.length; _i++) {
                var tagElem = _a[_i];
                if (tagElem === this.containerElem || tagElem.contains(this.containerElem)
                    || this.containerElem.contains(tagElem) || this.containsProcessed(tagElem)) {
                    continue;
                }
                if (this.compare(tagElem, matchingElem, matchingAttrNames, checkInner, chekAttrNum)) {
                    return tagElem;
                }
            }
            return null;
        };
        MetaState.prototype.filterExact = function (elems, matchingElem, checkInner) {
            return this.filter(elems, matchingElem, this.attrNames(matchingElem), checkInner, true);
        };
        MetaState.prototype.containsProcessed = function (elem) {
            return -1 < this.processedElements.indexOf(elem);
        };
        MetaState.prototype.filter = function (elems, matchingElem, attrNames, checkInner, checkAttrNum) {
            for (var _i = 0, elems_1 = elems; _i < elems_1.length; _i++) {
                var elem = elems_1[_i];
                if (!this.containsProcessed(elem)
                    && this.compare(elem, matchingElem, attrNames, checkInner, checkAttrNum)) {
                    return elem;
                }
            }
        };
        MetaState.prototype.compareExact = function (elem1, elem2, checkInner) {
            return this.compare(elem1, elem2, this.attrNames(elem1), checkInner, true);
        };
        MetaState.prototype.compare = function (elem1, elem2, attrNames, checkInner, checkAttrNum) {
            if (elem1.tagName !== elem2.tagName)
                return false;
            for (var _i = 0, attrNames_1 = attrNames; _i < attrNames_1.length; _i++) {
                var attrName = attrNames_1[_i];
                if (elem1.getAttribute(attrName) !== elem2.getAttribute(attrName)) {
                    return false;
                }
            }
            if (checkInner && elem1.innerHTML.trim() !== elem2.innerHTML.trim()) {
                return false;
            }
            if (checkAttrNum && elem1.attributes.length != elem2.attributes.length) {
                return false;
            }
            return true;
        };
        return MetaState;
    }());
    Jhtml.MetaState = MetaState;
    (function (Meta) {
        var Target;
        (function (Target) {
            Target[Target["HEAD"] = 1] = "HEAD";
            Target[Target["BODY"] = 2] = "BODY";
        })(Target = Meta.Target || (Meta.Target = {}));
    })(Meta = Jhtml.Meta || (Jhtml.Meta = {}));
    var LoadObserver = (function () {
        function LoadObserver() {
            this.loadCallbacks = [];
            this.readyCallback = [];
        }
        LoadObserver.prototype.addElement = function (elem) {
            var _this = this;
            var loadCallback = function () {
                _this.unregisterLoadCallback(loadCallback);
            };
            this.loadCallbacks.push(loadCallback);
            elem.addEventListener("load", loadCallback, false);
        };
        LoadObserver.prototype.unregisterLoadCallback = function (callback) {
            this.loadCallbacks.splice(this.loadCallbacks.indexOf(callback), 1);
            this.checkFire();
        };
        LoadObserver.prototype.whenLoaded = function (callback) {
            this.readyCallback.push(callback);
            this.checkFire();
        };
        LoadObserver.prototype.checkFire = function () {
            if (this.loadCallbacks.length > 0)
                return;
            var callback;
            while (callback = this.readyCallback.shift()) {
                callback();
            }
        };
        return LoadObserver;
    }());
    Jhtml.LoadObserver = LoadObserver;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Model = (function () {
        function Model(meta) {
            this.meta = meta;
            this.comps = {};
            this.additionalData = {};
        }
        Model.prototype.isFull = function () {
            return !!this.container;
        };
        return Model;
    }());
    Jhtml.Model = Model;
    var ModelState = (function () {
        function ModelState(metaState, container, comps) {
            this.metaState = metaState;
            this.container = container;
            this.comps = comps;
        }
        return ModelState;
    }());
    Jhtml.ModelState = ModelState;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var ModelFactory = (function () {
        function ModelFactory() {
        }
        ModelFactory.createFromJsonObj = function (jsonObj) {
            if (typeof jsonObj.content != "string") {
                throw new Jhtml.ParseError("Missing or invalid property 'content'.");
            }
            var rootElem = document.createElement("html");
            rootElem.innerHTML = jsonObj.content;
            var meta = ModelFactory.buildMeta(rootElem, false);
            ModelFactory.compileMetaElements(meta.headElements, "head", jsonObj);
            ModelFactory.compileMetaElements(meta.bodyElements, "bodyStart", jsonObj);
            ModelFactory.compileMetaElements(meta.bodyElements, "bodyEnd", jsonObj);
            var model = new Jhtml.Model(meta);
            if (meta.containerElement) {
                model.container = ModelFactory.compileContainer(meta.containerElement, model);
                model.comps = ModelFactory.compileComps(model.container, meta.containerElement, model);
            }
            else if (jsonObj.content) {
                rootElem = document.createElement("div");
                rootElem.innerHTML = jsonObj.content;
                model.snippet = new Jhtml.Snippet(Jhtml.Util.array(rootElem.children), model, document.createElement("template"));
            }
            if (jsonObj.additional) {
                model.additionalData = jsonObj.additional;
            }
            return model;
        };
        ModelFactory.createStateFromDocument = function (document) {
            var metaState = new Jhtml.MetaState(document.documentElement, document.head, document.body, ModelFactory.extractContainerElem(document.body, true));
            var container = ModelFactory.compileContainer(metaState.containerElement, null);
            var comps = ModelFactory.compileComps(container, metaState.containerElement, null);
            return new Jhtml.ModelState(metaState, container, comps);
        };
        ModelFactory.createFromHtml = function (htmlStr, full) {
            var templateElem = document.createElement("html");
            templateElem.innerHTML = htmlStr;
            var model = new Jhtml.Model(ModelFactory.buildMeta(templateElem, true));
            model.container = ModelFactory.compileContainer(model.meta.containerElement, model);
            model.comps = ModelFactory.compileComps(model.container, templateElem, model);
            model.container.detach();
            for (var _i = 0, _a = Object.values(model.comps); _i < _a.length; _i++) {
                var comp = _a[_i];
                comp.detach();
            }
            return model;
        };
        ModelFactory.extractHeadElem = function (rootElem, required) {
            var headElem = rootElem.querySelector("head");
            if (headElem || !required) {
                return headElem;
            }
            throw new Jhtml.ParseError("head element missing.");
        };
        ModelFactory.extractBodyElem = function (rootElem, required) {
            var bodyElem = rootElem.querySelector("body");
            if (bodyElem || !required) {
                return bodyElem;
            }
            throw new Jhtml.ParseError("body element missing.");
        };
        ModelFactory.buildMeta = function (rootElem, full) {
            var meta = new Jhtml.Meta();
            var elem;
            if ((elem = ModelFactory.extractContainerElem(rootElem, full))) {
                meta.containerElement = elem;
            }
            else {
                return meta;
            }
            if (elem = ModelFactory.extractBodyElem(rootElem, true)) {
                meta.bodyElements = Jhtml.Util.array(elem.children);
            }
            if (elem = ModelFactory.extractHeadElem(rootElem, false)) {
                meta.headElements = Jhtml.Util.array(elem.children);
            }
            return meta;
        };
        ModelFactory.extractContainerElem = function (rootElem, required) {
            var containerList = Jhtml.Util.find(rootElem, ModelFactory.CONTAINER_SELECTOR);
            if (containerList.length == 0) {
                if (!required)
                    return null;
                throw new Jhtml.ParseError("Jhtml container missing.");
            }
            if (containerList.length > 1) {
                if (!required)
                    return null;
                throw new Jhtml.ParseError("Multiple jhtml container detected.");
            }
            return containerList[0];
        };
        ModelFactory.compileContainer = function (containerElem, model) {
            return new Jhtml.Container(containerElem.getAttribute(ModelFactory.CONTAINER_ATTR), containerElem, model);
        };
        ModelFactory.compileComps = function (container, containerElem, model) {
            var comps = {};
            for (var _i = 0, _a = Jhtml.Util.find(containerElem, ModelFactory.COMP_SELECTOR); _i < _a.length; _i++) {
                var compElem = _a[_i];
                var name_4 = compElem.getAttribute(ModelFactory.COMP_ATTR);
                if (comps[name_4]) {
                    throw new Jhtml.ParseError("Duplicated comp name: " + name_4);
                }
                container.compElements[name_4] = compElem;
                comps[name_4] = new Jhtml.Comp(name_4, compElem, model);
            }
            return comps;
        };
        ModelFactory.compileMetaElements = function (elements, name, jsonObj) {
            if (!(jsonObj[name] instanceof Array)) {
                throw new Jhtml.ParseError("Missing or invalid property '" + name + "'.");
            }
            for (var _i = 0, _a = jsonObj.head; _i < _a.length; _i++) {
                var elemHtml = _a[_i];
                elements.push(ModelFactory.createElement(elemHtml));
            }
        };
        ModelFactory.createElement = function (elemHtml) {
            var templateElem = document.createElement("template");
            templateElem.innerHTML = elemHtml;
            return templateElem.content.firstChild;
        };
        ModelFactory.CONTAINER_ATTR = "data-jhtml-container";
        ModelFactory.COMP_ATTR = "data-jhtml-comp";
        ModelFactory.CONTAINER_SELECTOR = "[" + ModelFactory.CONTAINER_ATTR + "]";
        ModelFactory.COMP_SELECTOR = "[" + ModelFactory.COMP_ATTR + "]";
        return ModelFactory;
    }());
    Jhtml.ModelFactory = ModelFactory;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Monitor = (function () {
        function Monitor(container) {
            this.container = container;
            this.compHandlers = {};
            this.context = Jhtml.Context.from(container.ownerDocument);
            this.history = new Jhtml.History();
        }
        Object.defineProperty(Monitor.prototype, "compHandlerReg", {
            get: function () {
                return this.compHandlers;
            },
            enumerable: true,
            configurable: true
        });
        Monitor.prototype.registerCompHandler = function (compName, compHandler) {
            this.compHandlers[compName] = compHandler;
        };
        Monitor.prototype.unregisterCompHandler = function (compName) {
            delete this.compHandlers[compName];
        };
        Monitor.prototype.exec = function (urlExpr, requestConfig) {
            var _this = this;
            var url = Jhtml.Url.create(urlExpr);
            var config = Jhtml.FullRequestConfig.from(requestConfig);
            var page = this.history.getPageByUrl(url);
            if (!config.forceReload && page) {
                if (page.disposed) {
                    page.promise = this.context.requestor.lookupDirective(url);
                }
            }
            else {
                page = new Jhtml.Page(url, this.context.requestor.lookupDirective(url));
            }
            if (config.pushToHistory && page !== this.history.currentPage) {
                this.history.push(page);
            }
            page.promise.then(function (directive) {
                _this.handleDirective(directive);
            });
            return page.promise;
        };
        Monitor.prototype.handleDirective = function (directive) {
            directive.exec(this);
        };
        Monitor.prototype.lookupModel = function (url) {
            var _this = this;
            return new Promise(function (resolve) {
                _this.context.requestor.exec("GET", url).send().then(function (response) {
                    if (response.model) {
                        resolve(response.model);
                    }
                    else {
                        _this.handleDirective(response.directive);
                    }
                });
            });
        };
        Monitor.of = function (element, selfIncluded) {
            if (selfIncluded === void 0) { selfIncluded = true; }
            if (selfIncluded && element.matches("." + Monitor.CSS_CLASS)) {
                return Monitor.test(element);
            }
            if (element = element.closest("." + Monitor.CSS_CLASS)) {
                return Monitor.test(element);
            }
            return null;
        };
        Monitor.test = function (element) {
            var monitor = Jhtml.Util.getElemData(element, Monitor.KEY);
            if (element.classList.contains(Monitor.CSS_CLASS) && monitor instanceof Monitor) {
                return monitor;
            }
            return null;
        };
        Monitor.from = function (container) {
            var monitor = Monitor.test(container);
            if (monitor)
                return monitor;
            container.classList.add(Monitor.CSS_CLASS);
            monitor = new Monitor(container);
            Jhtml.Util.bindElemData(container, Monitor.KEY, monitor);
            return monitor;
        };
        Monitor.KEY = "jhtml-monitor";
        Monitor.CSS_CLASS = "jhtml-selfmonitored";
        return Monitor;
    }());
    Jhtml.Monitor = Monitor;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Content = (function () {
        function Content(elements, _model, detachedElem) {
            this.elements = elements;
            this._model = _model;
            this.detachedElem = detachedElem;
            this.cbr = new Jhtml.Util.CallbackRegistry();
            this.attached = false;
        }
        Object.defineProperty(Content.prototype, "model", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        Content.prototype.on = function (eventType, callback) {
            this.cbr.onType(eventType, callback);
        };
        Content.prototype.off = function (eventType, callback) {
            this.cbr.offType(eventType, callback);
        };
        Object.defineProperty(Content.prototype, "isAttached", {
            get: function () {
                return this.attached;
            },
            enumerable: true,
            configurable: true
        });
        Content.prototype.ensureDetached = function () {
            if (this.attached) {
                throw new Error("Element already attached.");
            }
        };
        Content.prototype.attach = function (element) {
            this.ensureDetached();
            for (var _i = 0, _a = Jhtml.Util.array(this.detachedElem.children); _i < _a.length; _i++) {
                var childElem = _a[_i];
                element.appendChild(childElem);
            }
            this.attached = true;
            this.cbr.fireType("attached");
        };
        Content.prototype.detach = function () {
            if (!this.attached)
                return;
            this.cbr.fireType("detach");
            for (var _i = 0, _a = this.elements; _i < _a.length; _i++) {
                var childElem = _a[_i];
                this.detachedElem.appendChild(childElem);
            }
            this.attached = false;
        };
        Content.prototype.dispose = function () {
            if (this.attached) {
                this.detach();
            }
            this.cbr.fireType("dispose");
            this.cbr = null;
            this.detachedElem.remove();
            this.detachedElem = null;
        };
        return Content;
    }());
    Jhtml.Content = Content;
    var Panel = (function (_super) {
        __extends(Panel, _super);
        function Panel(_name, attachedElem, model) {
            var _this = _super.call(this, Jhtml.Util.array(attachedElem.children), model, attachedElem.ownerDocument.createElement("template")) || this;
            _this._name = _name;
            _this.attached = true;
            return _this;
        }
        Object.defineProperty(Panel.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "loadObserver", {
            get: function () {
                return this._loadObserver;
            },
            enumerable: true,
            configurable: true
        });
        Panel.prototype.attachTo = function (element, loadObserver) {
            this._loadObserver = loadObserver;
            this.attach(element);
        };
        Panel.prototype.detach = function () {
            this._loadObserver = null;
            _super.prototype.detach.call(this);
        };
        return Panel;
    }(Content));
    Jhtml.Panel = Panel;
    var Container = (function (_super) {
        __extends(Container, _super);
        function Container() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.compElements = {};
            return _this;
        }
        Container.prototype.matches = function (container) {
            return this.name == container.name
                && JSON.stringify(Object.keys(this.compElements)) == JSON.stringify(Object.keys(container.compElements));
        };
        return Container;
    }(Panel));
    Jhtml.Container = Container;
    var Comp = (function (_super) {
        __extends(Comp, _super);
        function Comp() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Comp;
    }(Panel));
    Jhtml.Comp = Comp;
    var Snippet = (function (_super) {
        __extends(Snippet, _super);
        function Snippet() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Snippet.prototype.markAttached = function () {
            this.ensureDetached();
            this.attached = true;
            this.cbr.fireType("attached");
        };
        Snippet.prototype.attachTo = function (element) {
            this.attach(element);
        };
        return Snippet;
    }(Content));
    Jhtml.Snippet = Snippet;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var ParseError = (function (_super) {
        __extends(ParseError, _super);
        function ParseError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ParseError;
    }(Error));
    Jhtml.ParseError = ParseError;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var DocumentManager = (function () {
        function DocumentManager() {
        }
        return DocumentManager;
    }());
    Jhtml.DocumentManager = DocumentManager;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var FullModelDirective = (function () {
        function FullModelDirective(model) {
            this.model = model;
            if (!model.isFull()) {
                throw new Error("Invalid argument. Full model required.");
            }
        }
        FullModelDirective.prototype.getAdditionalData = function () {
            return this.model.additionalData;
        };
        FullModelDirective.prototype.exec = function (monitor) {
            monitor.context.import(this.model, monitor.compHandlerReg);
        };
        return FullModelDirective;
    }());
    Jhtml.FullModelDirective = FullModelDirective;
    var ReplaceDirective = (function () {
        function ReplaceDirective(status, responseText, mimeType, url) {
            this.status = status;
            this.responseText = responseText;
            this.mimeType = mimeType;
            this.url = url;
        }
        ReplaceDirective.prototype.getAdditionalData = function () {
            return null;
        };
        ReplaceDirective.prototype.exec = function (monitor) {
            monitor.context.replace(this.responseText, this.mimeType, monitor.history.currentPage.url.equals(this.url));
        };
        return ReplaceDirective;
    }());
    Jhtml.ReplaceDirective = ReplaceDirective;
    var RedirectDirective = (function () {
        function RedirectDirective(back, url, requestConfig, additionalData) {
            this.back = back;
            this.url = url;
            this.requestConfig = requestConfig;
            this.additionalData = additionalData;
        }
        RedirectDirective.prototype.getAdditionalData = function () {
            return this.additionalData;
        };
        RedirectDirective.prototype.exec = function (monitor) {
            if (this.back && !monitor.history.currentPage.url.equals(this.url))
                return;
            monitor.exec(this.url, this.requestConfig);
        };
        return RedirectDirective;
    }());
    Jhtml.RedirectDirective = RedirectDirective;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Request = (function () {
        function Request(requestor, _xhr, _url) {
            this.requestor = requestor;
            this._xhr = _xhr;
            this._url = _url;
        }
        Object.defineProperty(Request.prototype, "xhr", {
            get: function () {
                return this._xhr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Request.prototype, "url", {
            get: function () {
                return this._url;
            },
            enumerable: true,
            configurable: true
        });
        Request.prototype.abort = function () {
            this.xhr.abort();
        };
        Request.prototype.send = function (data) {
            this.xhr.send(data);
            return this.buildPromise();
        };
        Request.prototype.buildPromise = function () {
            var _this = this;
            return new Promise(function (resolve) {
                _this.xhr.onreadystatechange = function () {
                    if (_this.xhr.readyState != 4)
                        return;
                    switch (_this.xhr.status) {
                        case 200:
                            var model = void 0;
                            var directive = void 0;
                            if (!_this.xhr.getResponseHeader("Content-Type").match(/json/)) {
                                model = _this.createModelFromHtml(_this.xhr.responseText);
                            }
                            else {
                                var jsonObj = _this.createJsonObj(_this.url, _this.xhr.responseText);
                                if (!(directive = _this.scanForDirective(_this.url, jsonObj))) {
                                    model = _this.createModelFromJson(_this.url, jsonObj);
                                }
                            }
                            if (model && model.isFull()) {
                                directive = new Jhtml.FullModelDirective(model);
                            }
                            var response = { url: _this.url, model: model, directive: directive };
                            if (model) {
                                model.response = response;
                            }
                            resolve(response);
                            break;
                        default:
                            resolve({ url: _this.url, directive: new Jhtml.ReplaceDirective(_this.xhr.status, _this.xhr.responseText, _this.xhr.getResponseHeader("Content-Type"), _this.url) });
                    }
                };
                _this.xhr.onerror = function () {
                    throw new Error("Could not request " + _this.url.toString());
                };
            });
        };
        Request.prototype.createJsonObj = function (url, jsonText) {
            try {
                return JSON.parse(jsonText);
            }
            catch (e) {
                throw new Error(url + "; invalid json response: " + e.message);
            }
        };
        Request.prototype.scanForDirective = function (url, jsonObj) {
            switch (jsonObj.directive) {
                case "redirect":
                    return new Jhtml.RedirectDirective(false, Jhtml.Url.create(jsonObj.location), Jhtml.FullRequestConfig.from(jsonObj.requestConfig), jsonObj.additional);
                case "redirectBack":
                    return new Jhtml.RedirectDirective(true, Jhtml.Url.create(jsonObj.location), Jhtml.FullRequestConfig.from(jsonObj.requestConfig), jsonObj.additional);
                default:
                    return null;
            }
        };
        Request.prototype.createModelFromJson = function (url, jsonObj) {
            try {
                var model = Jhtml.ModelFactory.createFromJsonObj(jsonObj);
                this.requestor.context.registerNewModel(model);
                return model;
            }
            catch (e) {
                if (e instanceof Jhtml.ParseError || e instanceof SyntaxError) {
                    throw new Error(url + "; no or invalid json: " + e.message);
                }
                throw e;
            }
        };
        Request.prototype.createModelFromHtml = function (html) {
            try {
                var model = Jhtml.ModelFactory.createFromHtml(html, true);
                this.requestor.context.registerNewModel(model);
                return model;
            }
            catch (e) {
                throw new Error(this.url + "; invalid jhtml response: " + e.message);
            }
        };
        return Request;
    }());
    Jhtml.Request = Request;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var FullRequestConfig = (function () {
        function FullRequestConfig() {
            this.forceReload = false;
            this.pushToHistory = true;
        }
        FullRequestConfig.from = function (requestConfig) {
            if (requestConfig instanceof FullRequestConfig) {
                return requestConfig;
            }
            var config = new FullRequestConfig();
            if (!requestConfig)
                return config;
            if (requestConfig.forceReload !== undefined) {
                config.forceReload = requestConfig.forceReload;
            }
            if (requestConfig.pushToHistory !== undefined) {
                config.pushToHistory = requestConfig.pushToHistory;
            }
            return config;
        };
        FullRequestConfig.fromElement = function (element) {
            var reader = new Jhtml.Util.ElemConfigReader(element);
            var config = new FullRequestConfig();
            config.forceReload = reader.readBoolean("force-reload", config.forceReload);
            config.pushToHistory = reader.readBoolean("push-to-history", config.pushToHistory);
            return config;
        };
        return FullRequestConfig;
    }());
    Jhtml.FullRequestConfig = FullRequestConfig;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Requestor = (function () {
        function Requestor(_context) {
            this._context = _context;
        }
        Object.defineProperty(Requestor.prototype, "context", {
            get: function () {
                return this._context;
            },
            enumerable: true,
            configurable: true
        });
        Requestor.prototype.lookupDirective = function (url) {
            var _this = this;
            return new Promise(function (resolve) {
                _this.exec("GET", url).send().then(function (result) {
                    if (result.directive) {
                        resolve(result.directive);
                        return;
                    }
                    throw new Error(url + " provides no jhtml directive.");
                });
            });
        };
        Requestor.prototype.lookupModel = function (url) {
            var _this = this;
            return new Promise(function (resolve) {
                _this.exec("GET", url).send().then(function (result) {
                    if (result.directive) {
                        resolve(result.model);
                        return;
                    }
                    throw new Error(url + " provides no jhtml model.");
                });
            });
        };
        Requestor.prototype.exec = function (method, url) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url.toString(), true);
            xhr.setRequestHeader("Accept", "application/json,text/html");
            return new Jhtml.Request(this, xhr, url);
        };
        return Requestor;
    }());
    Jhtml.Requestor = Requestor;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Url = (function () {
        function Url(urlStr) {
            this.urlStr = urlStr;
        }
        Url.prototype.toString = function () {
            return this.urlStr;
        };
        Url.prototype.equals = function (url) {
            return this.urlStr == url.urlStr;
        };
        Url.prototype.extR = function (pathExt, queryExt) {
            if (pathExt === void 0) { pathExt = null; }
            if (queryExt === void 0) { queryExt = null; }
            var newUrlStr = this.urlStr;
            if (pathExt !== null || pathExt !== undefined) {
                newUrlStr.replace(/\/+$/, "") + "/" + encodeURI(pathExt);
            }
            if (queryExt !== null || queryExt !== undefined) {
                var parts = [];
                this.compileQueryParts(parts, queryExt, null);
                var queryExtStr = parts.join("&");
                if (newUrlStr.match(/\\?/)) {
                    newUrlStr += "&" + queryExtStr;
                }
                else {
                    newUrlStr += "?" + queryExtStr;
                }
            }
            return new Url(newUrlStr);
        };
        Url.prototype.compileQueryParts = function (parts, queryExt, prefix) {
            for (var key in queryExt) {
                var name_5 = null;
                if (prefix) {
                    name_5 = prefix + "[" + key + "]";
                }
                else {
                    name_5 = key;
                }
                var value = queryExt[key];
                if (value instanceof Array || value instanceof Object) {
                    this.compileQueryParts(parts, value, name_5);
                }
                else {
                    parts.push(encodeURIComponent(name_5) + "=" + encodeURIComponent(value));
                }
            }
        };
        Url.build = function (urlExpression) {
            if (urlExpression === null || urlExpression === undefined)
                return null;
            return Url.create(urlExpression);
        };
        Url.create = function (urlExpression) {
            if (urlExpression instanceof Url) {
                return urlExpression;
            }
            return new Url(Url.absoluteStr(urlExpression));
        };
        Url.absoluteStr = function (urlExpression) {
            if (urlExpression instanceof Url) {
                return urlExpression.toString();
            }
            var urlStr = urlExpression;
            if (!/^(?:\/|[a-z]+:\/\/)/.test(urlStr)) {
                return window.location.toString().replace(/\/+$/, "") + "/" + urlStr;
            }
            if (!/^(?:[a-z]+:)?\/\//.test(urlStr)) {
                return window.location.protocol + "//" + window.location.host + urlStr;
            }
            return urlStr;
        };
        return Url;
    }());
    Jhtml.Url = Url;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Ui;
    (function (Ui) {
        var Form = (function () {
            function Form(_element) {
                this._element = _element;
                this._observing = false;
                this._config = new Form.Config();
                this.callbackRegistery = new Jhtml.Util.CallbackRegistry();
                this.curRequest = null;
                this.controlLockAutoReleaseable = true;
            }
            Object.defineProperty(Form.prototype, "element", {
                get: function () {
                    return this._element;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Form.prototype, "observing", {
                get: function () {
                    return this._observing;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Form.prototype, "config", {
                get: function () {
                    return this._config;
                },
                enumerable: true,
                configurable: true
            });
            Form.prototype.reset = function () {
                this.element.reset();
            };
            Form.prototype.fire = function (eventType) {
                this.callbackRegistery.fireType(eventType.toString(), this);
            };
            Form.prototype.on = function (eventType, callback) {
                this.callbackRegistery.onType(eventType.toString(), callback);
            };
            Form.prototype.off = function (eventType, callback) {
                this.callbackRegistery.offType(eventType.toString(), callback);
            };
            Form.prototype.observe = function () {
                var _this = this;
                if (this._observing)
                    return;
                this._observing = true;
                this.element.addEventListener("submit", function (evt) {
                    evt.preventDefault();
                    return false;
                }, true);
                this.element.addEventListener("submit", function (evt) {
                    if (_this.config.autoSubmitAllowed)
                        return false;
                    _this.submit();
                }, false);
                Jhtml.Util.find(this.element, "input[type=submit], button[type=submit]").forEach(function (elem) {
                    elem.addEventListener("click", function (evt) {
                        evt.preventDefault();
                        return false;
                    }, true);
                    elem.addEventListener("click", function (evt) {
                        if (!_this.config.autoSubmitAllowed)
                            return;
                        _this.submit({ button: elem });
                    }, false);
                });
            };
            Form.prototype.buildFormData = function (submitConfig) {
                var formData = new FormData(this.element);
                if (submitConfig && submitConfig.button) {
                    formData.append(submitConfig.button.getAttribute("name"), submitConfig.button.getAttribute("value"));
                }
                return formData;
            };
            Form.prototype.block = function () {
                if (!this.controlLock && this.config.disableControls) {
                    this.disableControls();
                }
            };
            Form.prototype.unblock = function () {
                if (this.controlLock && this.controlLockAutoReleaseable) {
                    this.controlLock.release();
                }
            };
            Form.prototype.disableControls = function (autoReleaseable) {
                if (autoReleaseable === void 0) { autoReleaseable = true; }
                this.controlLockAutoReleaseable = autoReleaseable;
                if (this.controlLock)
                    return;
                this.controlLock = new ControlLock(this.element);
            };
            Form.prototype.enableControls = function () {
                if (this.controlLock) {
                    this.controlLock.release();
                    this.controlLock = null;
                    this.controlLockAutoReleaseable = true;
                }
            };
            Form.prototype.abortSubmit = function () {
                if (this.curRequest) {
                    var curXhr = this.curRequest;
                    this.curRequest = null;
                    curXhr.abort();
                    this.unblock();
                }
            };
            Form.prototype.submit = function (submitConfig) {
                var _this = this;
                this.abortSubmit();
                this.fire("submit");
                var url = Jhtml.Url.build(this.config.actionUrl || this.element.getAttribute("action"));
                var formData = this.buildFormData(submitConfig);
                var monitor = Jhtml.Monitor.of(this.element);
                var request = this.curRequest = Jhtml.getOrCreateContext(this.element.ownerDocument).requestor
                    .exec("POST", url);
                request.send(formData).then(function (response) {
                    if (_this.curRequest !== request)
                        return;
                    if ((!_this.config.successResponseHandler || !_this.config.successResponseHandler(response))
                        && monitor) {
                        monitor.handleDirective(response.directive);
                    }
                    if (submitConfig && submitConfig.success) {
                        submitConfig.success();
                    }
                    _this.unblock();
                    _this.fire("submitted");
                }).catch(function (e) {
                    if (_this.curRequest !== request)
                        return;
                    if (submitConfig && submitConfig.error) {
                        submitConfig.error();
                    }
                    _this.unblock();
                    _this.fire("submitted");
                });
                this.block();
            };
            Form.from = function (element) {
                var form = Jhtml.Util.getElemData(element, Form.KEY);
                if (form instanceof Form) {
                    return form;
                }
                form = new Form(element);
                Jhtml.Util.bindElemData(element, Form.KEY, form);
                form.observe();
                return form;
            };
            Form.KEY = "jhtml-form";
            return Form;
        }());
        Ui.Form = Form;
        var ControlLock = (function () {
            function ControlLock(containerElem) {
                this.containerElem = containerElem;
                this.lock();
            }
            ControlLock.prototype.lock = function () {
                if (this.controls)
                    return;
                this.controls = Jhtml.Util.find(this.containerElem, "input:not([disabled]), textarea:not([disabled]), button:not([disabled]), select:not([disabled])");
                for (var _i = 0, _a = this.controls; _i < _a.length; _i++) {
                    var control = _a[_i];
                    control.setAttribute("disabled", "disabled");
                }
            };
            ControlLock.prototype.release = function () {
                if (!this.controls)
                    return;
                for (var _i = 0, _a = this.controls; _i < _a.length; _i++) {
                    var control = _a[_i];
                    control.removeAttribute("disabled");
                }
                this.controls = null;
            };
            return ControlLock;
        }());
        (function (Form) {
            var Config = (function () {
                function Config() {
                    this.disableControls = true;
                    this.autoSubmitAllowed = true;
                    this.actionUrl = null;
                }
                return Config;
            }());
            Form.Config = Config;
        })(Form = Ui.Form || (Ui.Form = {}));
    })(Ui = Jhtml.Ui || (Jhtml.Ui = {}));
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Ui;
    (function (Ui) {
        var Link = (function () {
            function Link(elem) {
                var _this = this;
                this.elem = elem;
                this.dcr = new Jhtml.Util.CallbackRegistry();
                this.disabled = false;
                this.requestConfig = Jhtml.FullRequestConfig.fromElement(this.elem);
                elem.addEventListener("click", function (evt) {
                    evt.preventDefault();
                    _this.handle();
                    return false;
                });
            }
            Link.prototype.handle = function () {
                if (this.disabled)
                    return;
                this.dcr.fire(Jhtml.Monitor.of(this.elem).exec(this.elem.href, this.requestConfig));
            };
            Object.defineProperty(Link.prototype, "element", {
                get: function () {
                    return this.elem;
                },
                enumerable: true,
                configurable: true
            });
            Link.prototype.dispose = function () {
                this.elem.remove();
                this.elem = null;
                this.dcr.clear();
            };
            Link.prototype.onDirective = function (callback) {
                this.dcr.on(callback);
            };
            Link.prototype.offDirective = function (callback) {
                this.dcr.off(callback);
            };
            Link.from = function (element) {
                var link = Jhtml.Util.getElemData(element, Link.KEY);
                if (link instanceof Link) {
                    return link;
                }
                link = new Link(element);
                Jhtml.Util.bindElemData(element, Link.KEY, link);
                return link;
            };
            Link.KEY = "jhtml-link";
            return Link;
        }());
        Ui.Link = Link;
    })(Ui = Jhtml.Ui || (Jhtml.Ui = {}));
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Ui;
    (function (Ui) {
        var Scanner = (function () {
            function Scanner() {
            }
            Scanner.scan = function (elem) {
                for (var _i = 0, _a = Jhtml.Util.findAndSelf(elem, Scanner.A_SELECTOR); _i < _a.length; _i++) {
                    var linkElem = _a[_i];
                    Ui.Link.from(linkElem);
                }
                for (var _b = 0, _c = Jhtml.Util.findAndSelf(elem, Scanner.FORM_SELECTOR); _b < _c.length; _b++) {
                    var fromElem = _c[_b];
                    Ui.Form.from(fromElem);
                }
            };
            Scanner.scanArray = function (elems) {
                for (var _i = 0, elems_2 = elems; _i < elems_2.length; _i++) {
                    var elem = elems_2[_i];
                    Scanner.scan(elem);
                }
            };
            Scanner.A_ATTR = "data-jhtml";
            Scanner.A_SELECTOR = "a[" + Scanner.A_ATTR + "]";
            Scanner.FORM_ATTR = "data-jhtml";
            Scanner.FORM_SELECTOR = "form[" + Scanner.FORM_ATTR + "]";
            return Scanner;
        }());
        Ui.Scanner = Scanner;
    })(Ui = Jhtml.Ui || (Jhtml.Ui = {}));
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Util;
    (function (Util) {
        var CallbackRegistry = (function () {
            function CallbackRegistry() {
                this.callbacks = {};
            }
            CallbackRegistry.prototype.on = function (callback) {
                this.onType("", callback);
            };
            CallbackRegistry.prototype.onType = function (type, callback) {
                if (type === void 0) { type = ""; }
                if (!this.callbacks[type]) {
                    this.callbacks[type] = [];
                }
                if (-1 == this.callbacks[type].indexOf(callback)) {
                    this.callbacks[type].push(callback);
                }
            };
            CallbackRegistry.prototype.off = function (callback) {
                this.offType("", callback);
            };
            CallbackRegistry.prototype.offType = function (type, callback) {
                if (type === void 0) { type = ""; }
                if (!this.callbacks[type])
                    return;
                var i = this.callbacks[type].indexOf(callback);
                this.callbacks[type].splice(i, 1);
            };
            CallbackRegistry.prototype.fire = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                this.fireType.apply(this, [""].concat(args));
            };
            CallbackRegistry.prototype.fireType = function (type) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (!this.callbacks[type])
                    return;
                for (var _a = 0, _b = this.callbacks[type]; _a < _b.length; _a++) {
                    var callback = _b[_a];
                    callback.apply(void 0, args);
                }
            };
            CallbackRegistry.prototype.clear = function () {
                this.callbacks = {};
            };
            return CallbackRegistry;
        }());
        Util.CallbackRegistry = CallbackRegistry;
    })(Util = Jhtml.Util || (Jhtml.Util = {}));
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Util;
    (function (Util) {
        function closest(element, selector, selfIncluded) {
            do {
                if (element.matches(selector)) {
                    return element;
                }
            } while (element = element.parentElement);
        }
        Util.closest = closest;
        function getElemData(elem, key) {
            return elem["data-" + key];
        }
        Util.getElemData = getElemData;
        function bindElemData(elem, key, data) {
            elem["data-" + key] = data;
        }
        Util.bindElemData = bindElemData;
        function findAndSelf(element, selector) {
            var foundElems = find(element, selector);
            if (element.matches(selector)) {
                foundElems.unshift(element);
            }
            return foundElems;
        }
        Util.findAndSelf = findAndSelf;
        function find(nodeSelector, selector) {
            var foundElems = [];
            var nodeList = nodeSelector.querySelectorAll(selector);
            for (var i = 0; i < nodeList.length; i++) {
                foundElems.push(nodeList.item(i));
            }
            return foundElems;
        }
        Util.find = find;
        function array(nodeList) {
            var elems = [];
            for (var i = 0; i < nodeList.length; i++) {
                elems.push(nodeList.item(i));
            }
            return elems;
        }
        Util.array = array;
    })(Util = Jhtml.Util || (Jhtml.Util = {}));
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Util;
    (function (Util) {
        var ElemConfigReader = (function () {
            function ElemConfigReader(element) {
                this.element = element;
            }
            ElemConfigReader.prototype.buildName = function (key) {
                return "data-jhtml-" + key;
            };
            ElemConfigReader.prototype.readBoolean = function (key, fallback) {
                var value = this.element.getAttribute(this.buildName(key));
                if (value === null) {
                    return fallback;
                }
                switch (value) {
                    case "true":
                    case "TRUE:":
                        return true;
                    case "false":
                    case "FALSE":
                        return false;
                    default:
                        throw new Error("Attribute '" + this.buildName(key) + " of Element " + this.element.tagName
                            + "  must contain a boolean value 'true|false'.");
                }
            };
            return ElemConfigReader;
        }());
        Util.ElemConfigReader = ElemConfigReader;
    })(Util = Jhtml.Util || (Jhtml.Util = {}));
})(Jhtml || (Jhtml = {}));
//# sourceMappingURL=jhtml.js.map