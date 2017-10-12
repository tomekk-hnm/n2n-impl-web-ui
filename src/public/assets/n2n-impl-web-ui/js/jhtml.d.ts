declare namespace Jhtml {
    function holeradio(): void;
    function ready(callback: ReadyCallback): void;
    interface ReadyCallback {
        (Element: any): any;
    }
}
declare namespace Jhtml {
    class Monitor {
    }
}
declare namespace Jhtml {
    class Browser {
        private window;
        history: History;
        constructor(window: Window);
        private onPopstate(evt);
        private afsd();
    }
}
declare namespace Jhtml {
    class History {
        private _currentIndex;
        private _entries;
        private onNewEntryCallbacks;
        constructor();
        onNewEntry(callback: EntryCallback): void;
        offNewEntry(callback: EntryCallback): void;
    }
    interface EntryCallback {
        (index: number, context: AjahDirective): any;
    }
}
declare namespace Jhtml {
    class Content {
        private document;
        private updater;
        private compHandlers;
        constructor(document: Document);
        handle(model: Model): void;
        registerCompHandler(compName: string, compHandler: CompHandler): void;
        unregisterCompHandler(compName: string): void;
    }
    interface CompHandler {
        handleComp(comp: Comp, ajahDirective: AjahDirective): boolean;
    }
}
declare namespace Jhtml {
    class Updater {
        private document;
        constructor(document: Document);
        apply(model: Model): void;
        private clearHead();
        private dingsel(container, newElems);
        private find(container, newElem, matchingAttrNames, checkInner, chekAttrNum);
        private compare(elem1, elem2, attrNames, checkInner, checkAttrNum);
        private findExact(container, newElem);
    }
}
declare namespace Jhtml {
}
declare namespace Jhtml {
    class Model {
        headComplete: boolean;
        headElements: Array<Element>;
        bodyStartElements: Array<Element>;
        bodyEndElements: Array<Element>;
        comps: {
            [name: string]: Comp;
        };
        static createFromJsonObj(jsonObj: any, response: any): Model;
        private static compileContent(model, jsonObj);
        private static compileElements(elements, name, jsonObj);
        private static createElement(elemHtml);
    }
    class Comp {
        name: string;
        element: Element;
        model: Model;
        constructor(name: string, element: Element, model: Model);
    }
}
declare namespace Jhtml {
    class Requester {
        constructor();
        exec(url: Url): Promise<Response>;
        private upgradeResponse(response);
    }
}
declare namespace Jhtml {
    class Response {
        url: Url;
        status: number;
        text: string;
        ajahDirective: AjahDirective;
        constructor(url: Url, status: number, text: string, ajahDirective?: AjahDirective);
    }
    class AjahDirective {
        model: Model;
        constructor(model?: Model);
        exec(): void;
    }
}
declare namespace Jhtml {
    class Url {
        protected urlStr: string;
        constructor(urlStr: string);
        toString(): string;
        equals(url: Url): boolean;
        extR(pathExt: string): Url;
        static create(urlExpression: string | Url): Url;
        static absoluteStr(urlExpression: string | Url): string;
    }
}
