var Jhtml;
(function (Jhtml) {
    function holeradio() {
        var browser = new Jhtml.Browser(window);
        browser.history = new Jhtml.History();
        var content = new Jhtml.Content(document);
    }
    Jhtml.holeradio = holeradio;
    function ready(callback) {
    }
    Jhtml.ready = ready;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Monitor = (function () {
        function Monitor() {
        }
        return Monitor;
    }());
    Jhtml.Monitor = Monitor;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Browser = (function () {
        function Browser(window) {
            var _this = this;
            this.window = window;
            window.addEventListener("popstate", function (evt) { return _this.onPopstate(evt); });
        }
        Browser.prototype.onPopstate = function (evt) {
        };
        Browser.prototype.afsd = function () {
        };
        return Browser;
    }());
    Jhtml.Browser = Browser;
    var StateObj = (function () {
        function StateObj() {
        }
        return StateObj;
    }());
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var History = (function () {
        function History() {
            this.onNewEntryCallbacks = [];
        }
        History.prototype.onNewEntry = function (callback) {
            this.onNewEntryCallbacks.push(callback);
        };
        History.prototype.offNewEntry = function (callback) {
            for (var i in this.onNewEntryCallbacks) {
                if (this.onNewEntryCallbacks[i] === callback) {
                    this.onNewEntryCallbacks.splice(parseInt(i), 1);
                    break;
                }
            }
        };
        return History;
    }());
    Jhtml.History = History;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Content = (function () {
        function Content(document) {
            this.document = document;
            this.compHandlers = {};
            this.updater = new Jhtml.Updater(document);
        }
        Content.prototype.handle = function (model) {
            for (var _i = 0, _a = Object.values(model.comps); _i < _a.length; _i++) {
                var comp = _a[_i];
                if (this.compHandlers[comp.name]
                    && this.compHandlers.hanldeComp(comp)) {
                    continue;
                }
            }
        };
        Content.prototype.registerCompHandler = function (compName, compHandler) {
            this.compHandlers[compName] = compHandler;
        };
        Content.prototype.unregisterCompHandler = function (compName) {
            delete this.compHandlers[compName];
        };
        return Content;
    }());
    Jhtml.Content = Content;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Updater = (function () {
        function Updater(document) {
            this.document = document;
        }
        Updater.prototype.apply = function (model) {
            if (model.headComplete) {
                this.clearHead();
            }
            this.dingsel(document.head, model.headElements);
            this.dingsel(document.body, model.bodyStartElements);
            this.dingsel(document.body, model.bodyEndElements);
        };
        Updater.prototype.clearHead = function () {
            var elemsToRemove = new Array();
            var children = document.head.children;
            var length = children.length;
            for (var i in children) {
                if (children[i].tagName == "SCRIPT")
                    continue;
                elemsToRemove.push(children[i]);
            }
            for (var _i = 0, elemsToRemove_1 = elemsToRemove; _i < elemsToRemove_1.length; _i++) {
                var elem = elemsToRemove_1[_i];
                document.head.removeChild(elem);
            }
        };
        Updater.prototype.dingsel = function (container, newElems) {
            for (var _i = 0, newElems_1 = newElems; _i < newElems_1.length; _i++) {
                var elem = newElems_1[_i];
                switch (elem.tagName) {
                    case "SCRIPT":
                        if (!this.find(this.document, elem, ["src", "type"], true, false)) {
                            this.document.body.appendChild(elem);
                        }
                        break;
                    case "TITLE":
                        {
                            var oldElem = null;
                            if (oldElem = this.find(container, elem, [], false, false)) {
                                oldElem.parentElement.replaceChild(elem, oldElem);
                            }
                            container.appendChild(elem);
                        }
                        break;
                    case "STYLE":
                    case "LINK":
                    default:
                        {
                            var oldElem = null;
                            if (oldElem = this.findExact(this.document, elem)) {
                                oldElem.parentElement.replaceChild(elem, oldElem);
                            }
                            container.appendChild(elem);
                        }
                }
            }
        };
        Updater.prototype.find = function (container, newElem, matchingAttrNames, checkInner, chekAttrNum) {
            var list = container.querySelectorAll(newElem.tagName);
            for (var i in list) {
                var elem = list.item(parseInt(i));
                if (this.compare(elem, newElem, matchingAttrNames, checkInner, chekAttrNum)) {
                    return elem;
                }
            }
            return null;
        };
        Updater.prototype.compare = function (elem1, elem2, attrNames, checkInner, checkAttrNum) {
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
        Updater.prototype.findExact = function (container, newElem) {
            var attrNames = [];
            var attrs = newElem.attributes;
            for (var i in attrs) {
                attrNames.push(attrs[i].name);
            }
            return this.find(container, newElem, attrNames, true, true);
        };
        return Updater;
    }());
    Jhtml.Updater = Updater;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Model = (function () {
        function Model() {
            this.headComplete = false;
            this.headElements = [];
            this.bodyStartElements = [];
            this.bodyEndElements = [];
            this.comps = {};
        }
        Model.createFromJsonObj = function (jsonObj, response) {
            var model = new Model();
            Model.compileContent(model, jsonObj);
            Model.compileElements(model.headElements, "head", jsonObj);
            Model.compileElements(model.bodyStartElements, "bodyStart", jsonObj);
            Model.compileElements(model.bodyEndElements, "bodyEnd", jsonObj);
            return model;
        };
        Model.compileContent = function (model, jsonObj) {
            if (typeof jsonObj.content != "string") {
                throw new SyntaxError("Missing or invalid property 'content'.");
            }
            var template = document.createElement('template');
            template.innerHTML = jsonObj.content;
            var compNodeList = template.querySelectorAll(".jhtml-comp");
            for (var i = 0; i < compNodeList.length; i++) {
                var elem = compNodeList.item(i);
                var name_1 = elem.getAttribute("data-jhtml-name");
                if (model.comps[name_1 || ""]) {
                    throw new SyntaxError("Duplicated comp name: " + name_1);
                }
                model.comps[name_1 || ""] = new Comp(name_1, elem, model);
            }
            var headElem = template.querySelector("head");
            if (!headElem) {
                model.headComplete = true;
                var elemList = headElem.children;
                for (var i in elemList) {
                    model.headElements.push(elemList[i]);
                }
            }
        };
        Model.compileElements = function (elements, name, jsonObj) {
            if (!(jsonObj[name] instanceof Array)) {
                throw new SyntaxError("Missing or invalid property '" + name + "'.");
            }
            for (var _i = 0, _a = jsonObj.head; _i < _a.length; _i++) {
                var elemHtml = _a[_i];
                elements.push(Model.createElement(elemHtml));
            }
        };
        Model.createElement = function (elemHtml) {
            var templateElem = document.createElement("template");
            templateElem.innerHTML = elemHtml;
            return templateElem.firstElementChild;
        };
        return Model;
    }());
    Jhtml.Model = Model;
    var Comp = (function () {
        function Comp(name, element, model) {
            this.name = name;
            this.element = element;
            this.model = model;
        }
        return Comp;
    }());
    Jhtml.Comp = Comp;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Requester = (function () {
        function Requester() {
        }
        Requester.prototype.exec = function (url) {
            var _this = this;
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", url.toString(), true);
            xhttp.setRequestHeader("Accept", "application/json");
            xhttp.send();
            return new Promise(function (resolve) {
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState != 4)
                        return;
                    var response = new Jhtml.Response(url, xhttp.status, xhttp.responseText);
                    if (xhttp.status == 200) {
                        _this.upgradeResponse(response);
                    }
                    ;
                    resolve(response);
                };
                xhttp.onerror = function () {
                    throw new Error("Could not request " + url.toString());
                };
            });
        };
        Requester.prototype.upgradeResponse = function (response) {
            try {
                response.ajahDirective = new Jhtml.AjahDirective(Jhtml.Model.createFromJsonObj(JSON.parse(response.text)));
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    throw new Error(response.url + "; no or invalid json: " + e.message);
                }
                throw e;
            }
        };
        return Requester;
    }());
    Jhtml.Requester = Requester;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Response = (function () {
        function Response(url, status, text, ajahDirective) {
            if (ajahDirective === void 0) { ajahDirective = null; }
            this.url = url;
            this.status = status;
            this.text = text;
            this.ajahDirective = ajahDirective;
        }
        return Response;
    }());
    Jhtml.Response = Response;
    var AjahDirective = (function () {
        function AjahDirective(model) {
            if (model === void 0) { model = null; }
            this.model = model;
        }
        AjahDirective.prototype.exec = function () {
        };
        return AjahDirective;
    }());
    Jhtml.AjahDirective = AjahDirective;
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
//# sourceMappingURL=jhtml.js.map