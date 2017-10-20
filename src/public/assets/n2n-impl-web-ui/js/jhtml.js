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
            this._requestor = new Jhtml.Requestor(this);
            this.document.addEventListener("DOMContentLoaded", function () {
                _this.readyCbr.fire(_this.document.documentElement, {});
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
            return this.getBoundModel() ? true : false;
        };
        Context.prototype.getBoundModel = function () {
            if (!this.boundModel) {
                try {
                    this.boundModel = Jhtml.ModelFactory.createFromDocument(this.document);
                    Jhtml.Ui.Scanner.scan(this.document.documentElement);
                }
                catch (e) {
                    if (e instanceof Jhtml.ParseError)
                        return null;
                    throw e;
                }
            }
            return this.boundModel || null;
        };
        Context.prototype.import = function (newModel) {
            var boundModel = this.getBoundModel();
            if (!boundModel) {
                throw new Error("No jhtml context");
            }
            for (var name_1 in boundModel.comps) {
                var comp = boundModel.comps[name_1];
                if (!this.compHandlers[name_1] || !this.compHandlers[name_1].detachComp(comp)) {
                    comp.detach();
                }
            }
            boundModel.container.detach();
            boundModel.meta.replaceWith(newModel.meta);
            if (!boundModel.container.matches(newModel.container)) {
                boundModel.container = newModel.container;
            }
            boundModel.container.attachTo(boundModel.meta.containerElement);
            for (var name_2 in newModel.comps) {
                var comp = boundModel.comps[name_2] = newModel.comps[name_2];
                if (!this.compHandlers[name_2] || !this.compHandlers[name_2].attachComp(comp)) {
                    comp.attachTo(boundModel.container.compElements[name_2]);
                }
            }
        };
        Context.prototype.registerNewModel = function (model) {
            var _this = this;
            var container = model.container;
            var containerReadyCallback = function () {
                container.off("attached", containerReadyCallback);
                _this.readyCbr.fire(container.attachedElement, { container: container });
                Jhtml.Ui.Scanner.scan(container.attachedElement);
            };
            container.on("attached", containerReadyCallback);
            var _loop_1 = function (comp) {
                var compReadyCallback = function () {
                    comp.off("attached", containerReadyCallback);
                    _this.readyCbr.fire(comp.attachedElement, { comp: Jhtml.Comp });
                    Jhtml.Ui.Scanner.scan(comp.attachedElement);
                };
                comp.on("attached", containerReadyCallback);
            };
            for (var _i = 0, _a = Object.values(model.comps); _i < _a.length; _i++) {
                var comp = _a[_i];
                _loop_1(comp);
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
            if (this._document.readyState === "complete") {
                readyCallback(this.document.documentElement, {});
            }
        };
        Context.prototype.offReady = function (readyCallback) {
            this.readyCbr.off(readyCallback);
        };
        Context.test = function (document) {
            var context = Jhtml.Util.getElemData(document.body, Context.KEY);
            if (context instanceof Context) {
                return context;
            }
            return null;
        };
        Context.from = function (document) {
            var context = Context.test(document);
            if (context)
                return context;
            Jhtml.Util.bindElemData(document.body, Context.KEY, context = new Context(document));
            return context;
        };
        return Context;
    }());
    Context.KEY = "data-jhtml-context";
    Jhtml.Context = Context;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Meta = (function () {
        function Meta(rootElem, headElem, bodyElem, containerElem) {
            this.rootElem = rootElem;
            this.headElem = headElem;
            this.bodyElem = bodyElem;
            this.containerElem = containerElem;
        }
        Object.defineProperty(Meta.prototype, "headElements", {
            get: function () {
                return Jhtml.Util.array(this.headElem.children);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Meta.prototype, "bodyElements", {
            get: function () {
                return Jhtml.Util.array(this.bodyElem.children);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Meta.prototype, "containerElement", {
            get: function () {
                return this.containerElem;
            },
            enumerable: true,
            configurable: true
        });
        Meta.prototype.replaceWith = function (newMeta) {
            this.processedElements = [];
            this.removableElems = [];
            this.newMeta = newMeta;
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
        };
        Meta.prototype.mergeInto = function (newElems, parentElem, target) {
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
        Meta.prototype.mergeElem = function (preferedElems, newElem, target) {
            if (newElem === this.newMeta.containerElem) {
                if (!this.compareExact(this.containerElem, newElem, false)) {
                    var mergedElem_1 = newElem.cloneNode(false);
                    this.processedElements.push(mergedElem_1);
                    return mergedElem_1;
                }
                this.processedElements.push(this.containerElem);
                return this.containerElem;
            }
            if (newElem.contains(this.newMeta.containerElem)) {
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
        Meta.prototype.cloneNewElem = function (newElem, deep) {
            var mergedElem = newElem.cloneNode(deep);
            this.processedElements.push(mergedElem);
            return mergedElem;
        };
        Meta.prototype.attrNames = function (elem) {
            var attrNames = [];
            var attrs = elem.attributes;
            for (var i = 0; i < attrs.length; i++) {
                attrNames.push(attrs[i].nodeName);
            }
            return attrNames;
        };
        Meta.prototype.findExact = function (matchingElem, checkInner, target) {
            if (target === void 0) { target = Meta.Target.HEAD | Meta.Target.BODY; }
            return this.find(matchingElem, this.attrNames(matchingElem), checkInner, true, target);
        };
        Meta.prototype.find = function (matchingElem, matchingAttrNames, checkInner, checkAttrNum, target) {
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
        Meta.prototype.findIn = function (nodeSelector, matchingElem, matchingAttrNames, checkInner, chekAttrNum) {
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
        Meta.prototype.filterExact = function (elems, matchingElem, checkInner) {
            return this.filter(elems, matchingElem, this.attrNames(matchingElem), checkInner, true);
        };
        Meta.prototype.containsProcessed = function (elem) {
            return -1 < this.processedElements.indexOf(elem);
        };
        Meta.prototype.filter = function (elems, matchingElem, attrNames, checkInner, checkAttrNum) {
            for (var _i = 0, elems_1 = elems; _i < elems_1.length; _i++) {
                var elem = elems_1[_i];
                if (!this.containsProcessed(elem)
                    && this.compare(elem, matchingElem, attrNames, checkInner, checkAttrNum)) {
                    return elem;
                }
            }
        };
        Meta.prototype.compareExact = function (elem1, elem2, checkInner) {
            return this.compare(elem1, elem2, this.attrNames(elem1), checkInner, true);
        };
        Meta.prototype.compare = function (elem1, elem2, attrNames, checkInner, checkAttrNum) {
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
        return Meta;
    }());
    Jhtml.Meta = Meta;
    (function (Meta) {
        var Target;
        (function (Target) {
            Target[Target["HEAD"] = 1] = "HEAD";
            Target[Target["BODY"] = 2] = "BODY";
        })(Target = Meta.Target || (Meta.Target = {}));
    })(Meta = Jhtml.Meta || (Jhtml.Meta = {}));
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Model = (function () {
        function Model(meta) {
            this.meta = meta;
            this.comps = {};
        }
        return Model;
    }());
    Jhtml.Model = Model;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var ModelFactory = (function () {
        function ModelFactory() {
        }
        ModelFactory.createFromJsonObj = function (jsonObj) {
            throw new Error("not yet implemented");
        };
        ModelFactory.createFromDocument = function (document) {
            var model = new Jhtml.Model(ModelFactory.createMeta(document.documentElement));
            ModelFactory.compileContent(model, document.documentElement);
            return model;
        };
        ModelFactory.createFromHtml = function (htmlStr) {
            var templateElem = document.createElement("html");
            templateElem.innerHTML = htmlStr;
            var model = new Jhtml.Model(ModelFactory.createMeta(templateElem));
            ModelFactory.compileContent(model, templateElem);
            model.container.detach();
            for (var _i = 0, _a = Object.values(model.comps); _i < _a.length; _i++) {
                var comp = _a[_i];
                comp.detach();
            }
            return model;
        };
        ModelFactory.createMeta = function (rootElem) {
            var headElem = rootElem.querySelector("head");
            var bodyElem = rootElem.querySelector("body");
            if (!headElem) {
                throw new Jhtml.ParseError("head element missing.");
            }
            if (!bodyElem) {
                throw new Jhtml.ParseError("body element missing.");
            }
            var containerList = Jhtml.Util.find(bodyElem, ModelFactory.CONTAINER_SELECTOR);
            if (containerList.length == 0) {
                throw new Jhtml.ParseError("Jhtml container missing.");
            }
            if (containerList.length > 1) {
                throw new Jhtml.ParseError("Multiple jhtml container detected.");
            }
            return new Jhtml.Meta(rootElem, headElem, bodyElem, containerList[0]);
        };
        ModelFactory.compileContent = function (model, rootElem) {
            var containerElem = model.meta.containerElement;
            var document = containerElem.ownerDocument;
            model.container = new Jhtml.Container(containerElem.getAttribute(ModelFactory.CONTAINER_ATTR), containerElem);
            for (var _i = 0, _a = Jhtml.Util.find(containerElem, ModelFactory.COMP_SELECTOR); _i < _a.length; _i++) {
                var compElem = _a[_i];
                var name_3 = compElem.getAttribute(ModelFactory.COMP_ATTR);
                if (model.comps[name_3]) {
                    throw new Jhtml.ParseError("Duplicated comp name: " + name_3);
                }
                model.container.compElements[name_3] = compElem;
                model.comps[name_3] = new Jhtml.Comp(name_3, compElem);
            }
        };
        ModelFactory.createElement = function (elemHtml) {
            var templateElem = document.createElement("template");
            templateElem.innerHTML = elemHtml;
            return templateElem.firstElementChild;
        };
        return ModelFactory;
    }());
    ModelFactory.CONTAINER_ATTR = "data-jhtml-container";
    ModelFactory.COMP_ATTR = "data-jhtml-comp";
    ModelFactory.CONTAINER_SELECTOR = "[" + ModelFactory.CONTAINER_ATTR + "]";
    ModelFactory.COMP_SELECTOR = "[" + ModelFactory.COMP_ATTR + "]";
    Jhtml.ModelFactory = ModelFactory;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Monitor = (function () {
        function Monitor(container) {
            this.container = container;
            this.context = Jhtml.Context.from(container.ownerDocument);
            this.history = new Jhtml.History();
        }
        Monitor.prototype.exec = function (urlExpr, requestConfig) {
            var url = Jhtml.Url.create(urlExpr);
            var config = Jhtml.FullRequestConfig.from(requestConfig);
            var page = this.history.getPageByUrl(url);
            if (!config.forceReload && page) {
                if (!page.disposed) {
                    page.promise = this.context.requestor.lookupDirective(url);
                }
                if (config.pushToHistory && page !== this.history.currentPage) {
                    this.history.push(page);
                }
                this.dingsel(page.promise);
                return page.promise;
            }
            page = new Jhtml.Page(url, this.context.requestor.lookupDirective(url));
            if (config.pushToHistory) {
                this.history.push(page);
            }
            this.dingsel(page.promise);
            return page.promise;
        };
        Monitor.prototype.dingsel = function (promise) {
            var _this = this;
            promise.then(function (directive) {
                directive.exec(_this.context, _this.history);
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
        return Monitor;
    }());
    Monitor.KEY = "jhtml-monitor";
    Monitor.CSS_CLASS = "jhtml-selfmonitored";
    Jhtml.Monitor = Monitor;
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
    var ModelDirective = (function () {
        function ModelDirective(model) {
            this.model = model;
        }
        ModelDirective.prototype.exec = function (context, history) {
            context.import(this.model);
        };
        return ModelDirective;
    }());
    Jhtml.ModelDirective = ModelDirective;
    var ReplaceDirective = (function () {
        function ReplaceDirective(status, responseText) {
            this.status = status;
            this.responseText = responseText;
        }
        ReplaceDirective.prototype.exec = function (context, history) {
            alert("replace");
        };
        return ReplaceDirective;
    }());
    Jhtml.ReplaceDirective = ReplaceDirective;
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
        function Requestor(context) {
            this.context = context;
        }
        Requestor.prototype.lookupDirective = function (url) {
            var _this = this;
            return new Promise(function (resolve) {
                _this.lookup(url).then(function (result) {
                    resolve(result.directive);
                });
            });
        };
        Requestor.prototype.lookup = function (url) {
            var _this = this;
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", url.toString(), true);
            xhttp.setRequestHeader("Accept", "application/json,text/html");
            xhttp.send();
            return new Promise(function (resolve) {
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState != 4)
                        return;
                    switch (xhttp.status) {
                        case 200:
                            var model = void 0;
                            if (xhttp.responseType.match(/json/)) {
                                model = _this.createModelFromJson(url, xhttp.responseText);
                            }
                            else {
                                model = _this.createModelFromHtml(xhttp.responseText);
                            }
                            resolve({ model: model, directive: new Jhtml.ModelDirective(model) });
                            break;
                        default:
                            resolve({ directive: new Jhtml.ReplaceDirective(xhttp.status, xhttp.responseText) });
                    }
                };
                xhttp.onerror = function () {
                    throw new Error("Could not request " + url.toString());
                };
            });
        };
        Requestor.prototype.createModelFromJson = function (url, jsonText) {
            try {
                var model = Jhtml.ModelFactory.createFromJsonObj(JSON.parse(jsonText));
                this.context.registerNewModel(model);
                return model;
            }
            catch (e) {
                if (e instanceof Jhtml.ParseError) {
                    throw new Error(url + "; no or invalid json: " + e.message);
                }
                throw e;
            }
        };
        Requestor.prototype.createModelFromHtml = function (html) {
            var model = Jhtml.ModelFactory.createFromHtml(html);
            this.context.registerNewModel(model);
            return model;
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
        Url.prototype.extR = function (pathExt) {
            if (pathExt === null || pathExt === undefined) {
                return this;
            }
            return new Url(this.urlStr.replace(/\/+$/, "") + "/" + encodeURI(pathExt));
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
    var Link = (function () {
        function Link(elem) {
            var _this = this;
            this.elem = elem;
            this.requestConfig = Jhtml.FullRequestConfig.fromElement(this.elem);
            elem.addEventListener("click", function (evt) {
                evt.preventDefault();
                _this.handle();
                return false;
            });
        }
        Link.prototype.handle = function () {
            Jhtml.Monitor.of(this.elem).exec(this.elem.href, this.requestConfig);
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
        return Link;
    }());
    Link.KEY = "jhtml-link";
    Jhtml.Link = Link;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Ui;
    (function (Ui) {
        var Scanner = (function () {
            function Scanner() {
            }
            Scanner.scan = function (rootElem) {
                for (var _i = 0, _a = Jhtml.Util.find(rootElem, Scanner.A_SELECTOR); _i < _a.length; _i++) {
                    var elem = _a[_i];
                    Jhtml.Link.from(elem);
                }
            };
            return Scanner;
        }());
        Scanner.A_ATTR = "data-jhtml";
        Scanner.A_SELECTOR = "[" + Scanner.A_ATTR + "]";
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
                return "data-" + key;
            };
            ElemConfigReader.prototype.readBoolean = function (key, fallback) {
                var value = this.element.getAttribute("data-" + this.buildName(key));
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
var Jhtml;
(function (Jhtml) {
    var Content = (function () {
        function Content(_name, _attachedElem) {
            this._name = _name;
            this._attachedElem = _attachedElem;
            this.cbr = new Jhtml.Util.CallbackRegistry();
            this.detachedElem = _attachedElem.ownerDocument.createElement("template");
        }
        Object.defineProperty(Content.prototype, "name", {
            get: function () {
                return this._name;
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
        Object.defineProperty(Content.prototype, "attachedElement", {
            get: function () {
                return this._attachedElem;
            },
            enumerable: true,
            configurable: true
        });
        Content.prototype.attachTo = function (element) {
            if (this._attachedElem) {
                throw new Error("Element already attached.");
            }
            this._attachedElem = element;
            for (var _i = 0, _a = Jhtml.Util.array(this.detachedElem.children); _i < _a.length; _i++) {
                var childElem = _a[_i];
                element.appendChild(childElem);
            }
            this.cbr.fireType("attached");
        };
        Object.defineProperty(Content.prototype, "attached", {
            get: function () {
                return this._attachedElem ? true : false;
            },
            enumerable: true,
            configurable: true
        });
        Content.prototype.detach = function () {
            if (!this._attachedElem)
                return;
            this.cbr.fireType("detach");
            for (var _i = 0, _a = Jhtml.Util.array(this._attachedElem.children); _i < _a.length; _i++) {
                var childElem = _a[_i];
                this.detachedElem.appendChild(childElem);
            }
            this._attachedElem = null;
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
    var Container = (function (_super) {
        __extends(Container, _super);
        function Container() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.compElements = {};
            return _this;
        }
        Container.prototype.matches = function (container) {
            return this.name == container.name
                && JSON.stringify(Object.keys(this.compElements)) != JSON.stringify(Object.keys(container.compElements));
        };
        return Container;
    }(Content));
    Jhtml.Container = Container;
    var Comp = (function (_super) {
        __extends(Comp, _super);
        function Comp() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Comp;
    }(Content));
    Jhtml.Comp = Comp;
})(Jhtml || (Jhtml = {}));
//# sourceMappingURL=jhtml.js.map