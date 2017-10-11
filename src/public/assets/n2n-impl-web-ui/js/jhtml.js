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
    var Comp = (function () {
        function Comp(name) {
            this.name = name;
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
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", url.toString(), true);
            xhttp.setRequestHeader("Accept", "application/json");
            xhttp.send();
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    alert(xhttp.responseText);
                    var myArr = JSON.parse(xhttp.responseText);
                    alert(myArr);
                }
                ;
            };
            return new Promise(function (resolve) {
                resolve(new Jhtml.Response(url));
            });
        };
        return Requester;
    }());
    Jhtml.Requester = Requester;
})(Jhtml || (Jhtml = {}));
var Jhtml;
(function (Jhtml) {
    var Response = (function () {
        function Response(_url) {
            this._url = _url;
        }
        Object.defineProperty(Response.prototype, "url", {
            get: function () {
                return this._url;
            },
            enumerable: true,
            configurable: true
        });
        return Response;
    }());
    Jhtml.Response = Response;
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