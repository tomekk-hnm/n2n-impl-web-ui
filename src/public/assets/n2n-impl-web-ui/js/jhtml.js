var Jhtml;
(function (Jhtml) {
    function holeradio() {
        new Jhtml.Monitor();
    }
    Jhtml.holeradio = holeradio;
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
            this.onNewEntry(callback);
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
                    if (xhttp.status == 200) {
                        resolve(_this.createResponse(url, xhttp.responseText));
                    }
                    ;
                    throw new Error(url.toString() + "; Status: " + xhttp.status);
                };
                xhttp.onerror = function () {
                    console.log(xhttp.readyState + " " + xhttp.status);
                    throw new Error("Could not request " + url.toString());
                };
            });
        };
        Requester.prototype.createResponse = function (url, responseText) {
            try {
                return new OkResponse(Jhtml.Model.createFromJsonObj(JSON.parse(responseText)));
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    throw new Error(url + "; no or invalid json: " + e.message);
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
    interface;
    var Response = (function () {
        function Response() {
        }
        return Response;
    }());
    var OkResponse = (function () {
        function OkResponse() {
        }
        OkResponse.prototype.getUrl = function () {
            return this.url;
        };
        return OkResponse;
    }());
    var ErrResponse = (function () {
        function ErrResponse(status, responseText) {
            this.status = status;
            this.responseText = responseText;
        }
        return ErrResponse;
    }());
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var ResponseFactory = (function () {
        function ResponseFactory() {
        }
        ResponseFactory.createResponse = function (url, jsonObj) {
        };
        return ResponseFactory;
    }());
    Jhtml.ResponseFactory = ResponseFactory;
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
    var Model = (function () {
        function Model() {
            this.headComplete = false;
            this.headElements = [];
            this.bodyStartElements = [];
            this.bodyEndElements = [];
            this.compElements = {};
        }
        Model.createFromJsonObj = function (jsonObj) {
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
                model.compElements[elem.getAttribute("data-jhtml-name") || ""] = elem;
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
})(Jhtml || (Jhtml = {}));
//# sourceMappingURL=jhtml.js.map