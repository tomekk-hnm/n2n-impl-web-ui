declare namespace Jhtml {
    function ready(callback: ReadyCallback, document?: Document): void;
    function getOrCreateBrowser(): Browser;
    function getOrCreateMonitor(): Monitor;
    function getOrCreateContext(document?: Document): Context;
    function lookupModel(url: Url | string): Promise<Model>;
}
declare namespace Jhtml {
    class Browser {
        private window;
        private _history;
        constructor(window: Window, _history: History);
        readonly history: History;
        private onPopstate(evt);
        private onChanged();
        private onPush(entry);
    }
}
declare namespace Jhtml {
    class History {
        private _currentIndex;
        private _entries;
        private changedCbr;
        private pushCbr;
        readonly currentEntry: History.Entry;
        readonly currentPage: Page;
        getPageByUrl(url: Url): Page;
        onChanged(callback: () => any): void;
        offChanged(callback: () => any): void;
        onPush(callback: EntryCallback): void;
        offPush(callback: EntryCallback): void;
        go(index: number, checkUrl?: Url): void;
        push(page: Page): void;
    }
    interface EntryCallback {
        (entry: History.Entry): any;
    }
    namespace History {
        class Entry {
            private _index;
            private _page;
            browserHistoryIndex: number;
            constructor(_index: number, _page: Page);
            readonly index: number;
            readonly page: Page;
        }
    }
}
declare namespace Jhtml {
    class Page {
        private _url;
        promise: Promise<Directive> | null;
        private _loaded;
        constructor(_url: Url, promise: Promise<Directive> | null);
        readonly loaded: boolean;
        readonly url: Url;
        dispose(): void;
        readonly disposed: boolean;
    }
}
declare namespace Jhtml {
    class Context {
        private _document;
        private _requestor;
        private modelState;
        private compHandlers;
        private readyCbr;
        constructor(_document: Document);
        private readyBound;
        readonly requestor: Requestor;
        readonly document: Document;
        isJhtml(): boolean;
        private getModelState(required);
        import(newModel: Model, montiorCompHandlers?: {
            [compName: string]: CompHandler;
        }): void;
        importMeta(meta: Meta): LoadObserver;
        private loadObservers;
        private registerLoadObserver(loadObserver);
        registerNewModel(model: Model): void;
        replace(text: string, mimeType: string, replace: boolean): void;
        registerCompHandler(compName: string, compHandler: CompHandler): void;
        unregisterCompHandler(compName: string): void;
        onReady(readyCallback: ReadyCallback): void;
        offReady(readyCallback: ReadyCallback): void;
        private static KEY;
        static test(document: Document): Context | null;
        static from(document: Document): Context;
    }
    interface CompHandler {
        attachComp(comp: Comp, loadObserver: LoadObserver): boolean;
        detachComp(comp: Comp): boolean;
    }
    interface CompHandlerReg {
        [compName: string]: CompHandler;
    }
    interface ReadyCallback {
        (elements: Array<Element>, event: ReadyEvent): any;
    }
    interface ReadyEvent {
        container?: Container;
        comp?: Comp;
        snippet?: Snippet;
    }
}
declare namespace Jhtml {
    class Meta {
        headElements: Array<Element>;
        bodyElements: Array<Element>;
        containerElement: Element | null;
    }
    class MetaState {
        private rootElem;
        private headElem;
        private bodyElem;
        private containerElem;
        constructor(rootElem: Element, headElem: Element, bodyElem: Element, containerElem: Element);
        readonly headElements: Array<Element>;
        readonly bodyElements: Array<Element>;
        readonly containerElement: Element;
        private processedElements;
        private removableElems;
        private newMeta;
        private loadObserver;
        import(newMeta: Meta): LoadObserver;
        replaceWith(newMeta: Meta): LoadObserver;
        private mergeInto(newElems, parentElem, target);
        private mergeElem(preferedElems, newElem, target);
        private cloneNewElem(newElem, deep);
        private attrNames(elem);
        private findExact(matchingElem, checkInner, target?);
        private find(matchingElem, matchingAttrNames, checkInner, checkAttrNum, target?);
        private findIn(nodeSelector, matchingElem, matchingAttrNames, checkInner, chekAttrNum);
        private filterExact(elems, matchingElem, checkInner);
        private containsProcessed(elem);
        private filter(elems, matchingElem, attrNames, checkInner, checkAttrNum);
        private compareExact(elem1, elem2, checkInner);
        private compare(elem1, elem2, attrNames, checkInner, checkAttrNum);
    }
    namespace Meta {
        enum Target {
            HEAD = 1,
            BODY = 2,
        }
    }
    class LoadObserver {
        private loadCallbacks;
        private readyCallback;
        constructor();
        addElement(elem: Element): void;
        private unregisterLoadCallback(callback);
        whenLoaded(callback: () => any): void;
        private checkFire();
    }
}
declare namespace Jhtml {
    class Model {
        meta: Meta;
        constructor(meta: Meta);
        response: Response | null;
        container: Container;
        comps: {
            [name: string]: Comp;
        };
        snippet: Snippet;
        additionalData: any;
        isFull(): boolean;
    }
    class ModelState {
        metaState: MetaState;
        container: Container;
        comps: {
            [name: string]: Comp;
        };
        constructor(metaState: MetaState, container: Container, comps: {
            [name: string]: Comp;
        });
    }
}
declare namespace Jhtml {
    class ModelFactory {
        static readonly CONTAINER_ATTR: string;
        static readonly COMP_ATTR: string;
        private static readonly CONTAINER_SELECTOR;
        private static readonly COMP_SELECTOR;
        static createFromJsonObj(jsonObj: any): Model;
        static createStateFromDocument(document: Document): ModelState;
        static createFromHtml(htmlStr: string, full: boolean): Model;
        private static extractHeadElem(rootElem, required);
        private static extractBodyElem(rootElem, required);
        static buildMeta(rootElem: Element, full: boolean): Meta;
        private static extractContainerElem(rootElem, required);
        private static compileContainer(containerElem, model);
        private static compileComps(container, containerElem, model);
        private static compileMetaElements(elements, name, jsonObj);
        private static createElement(elemHtml);
    }
}
declare namespace Jhtml {
    class Monitor {
        private container;
        context: Context;
        history: History;
        private compHandlers;
        constructor(container: Element);
        readonly compHandlerReg: CompHandlerReg;
        registerCompHandler(compName: string, compHandler: CompHandler): void;
        unregisterCompHandler(compName: string): void;
        exec(urlExpr: Url | string, requestConfig?: RequestConfig): Promise<Directive>;
        handleDirective(directive: Directive): void;
        lookupModel(url: Url): Promise<Model>;
        private static readonly KEY;
        private static readonly CSS_CLASS;
        static of(element: Element, selfIncluded?: boolean): Monitor | null;
        static test(element: Element): Monitor | null;
        static from(container: Element): Monitor;
    }
}
declare namespace Jhtml {
    abstract class Content {
        elements: Array<Element>;
        private _model;
        private detachedElem;
        protected cbr: Util.CallbackRegistry<() => any>;
        protected attached: boolean;
        constructor(elements: Array<Element>, _model: Model, detachedElem: Element);
        readonly model: Model;
        on(eventType: Content.EventType, callback: () => any): void;
        off(eventType: Content.EventType, callback: () => any): void;
        readonly isAttached: boolean;
        protected ensureDetached(): void;
        protected attach(element: Element): void;
        detach(): void;
        dispose(): void;
    }
    abstract class Panel extends Content {
        private _name;
        private _loadObserver;
        constructor(_name: string, attachedElem: Element, model: Model);
        readonly name: string;
        readonly loadObserver: LoadObserver;
        attachTo(element: Element, loadObserver: LoadObserver): void;
        detach(): void;
    }
    namespace Content {
        type EventType = "attached" | "detach" | "dispose";
    }
    class Container extends Panel {
        compElements: {
            [name: string]: Element;
        };
        matches(container: Container): boolean;
    }
    class Comp extends Panel {
    }
    class Snippet extends Content {
        markAttached(): void;
        attachTo(element: Element): void;
    }
}
declare namespace Jhtml {
    class ParseError extends Error {
    }
}
declare namespace Jhtml {
    class DocumentManager {
    }
}
declare namespace Jhtml {
    interface Directive {
        getAdditionalData(): any;
        exec(monitor: Monitor): any;
    }
    class FullModelDirective implements Directive {
        private model;
        constructor(model: Model);
        getAdditionalData(): any;
        exec(monitor: Monitor): void;
    }
    class ReplaceDirective implements Directive {
        status: number;
        responseText: string;
        mimeType: string;
        url: Url;
        constructor(status: number, responseText: string, mimeType: string, url: Url);
        getAdditionalData(): any;
        exec(monitor: Monitor): void;
    }
    class RedirectDirective {
        back: boolean;
        url: Url;
        requestConfig: RequestConfig;
        additionalData: any;
        constructor(back: boolean, url: Url, requestConfig?: RequestConfig, additionalData?: any);
        getAdditionalData(): any;
        exec(monitor: Monitor): void;
    }
}
declare namespace Jhtml {
}
declare namespace Jhtml {
    class Request {
        private requestor;
        private _xhr;
        private _url;
        constructor(requestor: Requestor, _xhr: XMLHttpRequest, _url: Url);
        readonly xhr: XMLHttpRequest;
        readonly url: Url;
        abort(): void;
        send(data?: FormData): Promise<Response>;
        private buildPromise();
        private createJsonObj(url, jsonText);
        private scanForDirective(url, jsonObj);
        private createModelFromJson(url, jsonObj);
        private createModelFromHtml(html);
    }
}
declare namespace Jhtml {
    interface RequestConfig {
        forceReload?: boolean;
        pushToHistory?: boolean;
    }
    class FullRequestConfig implements RequestConfig {
        forceReload: boolean;
        pushToHistory: boolean;
        static from(requestConfig: RequestConfig): FullRequestConfig;
        static fromElement(element: Element): FullRequestConfig;
    }
}
declare namespace Jhtml {
    class Requestor {
        private _context;
        constructor(_context: Context);
        readonly context: Context;
        lookupDirective(url: Url): Promise<Directive>;
        lookupModel(url: Url): Promise<Model>;
        exec(method: Requestor.Method, url: Url): Request;
    }
    namespace Requestor {
        type Method = "GET" | "POST" | "PUT" | "DELETE";
    }
}
declare namespace Jhtml {
    interface Response {
        url: Url;
        model?: Model;
        directive: Directive;
    }
}
declare namespace Jhtml {
    class Url {
        protected urlStr: string;
        constructor(urlStr: string);
        toString(): string;
        equals(url: Url): boolean;
        extR(pathExt?: string, queryExt?: {
            [key: string]: any;
        }): Url;
        private compileQueryParts(parts, queryExt, prefix);
        static build(urlExpression: string | Url): Url | null;
        static create(urlExpression: string | Url): Url;
        static absoluteStr(urlExpression: string | Url): string;
    }
}
declare namespace Jhtml.Ui {
    class Form {
        private _element;
        private _observing;
        private _config;
        private callbackRegistery;
        private curRequest;
        constructor(_element: HTMLFormElement);
        readonly element: HTMLFormElement;
        readonly observing: boolean;
        readonly config: Form.Config;
        reset(): void;
        private fire(eventType);
        on(eventType: Form.EventType, callback: FormCallback): void;
        off(eventType: Form.EventType, callback: FormCallback): void;
        observe(): void;
        private buildFormData(submitConfig?);
        private controlLock;
        private controlLockAutoReleaseable;
        private block();
        private unblock();
        disableControls(autoReleaseable?: boolean): void;
        enableControls(): void;
        abortSubmit(): void;
        submit(submitConfig?: Form.SubmitDirective): void;
        private static readonly KEY;
        static from(element: HTMLFormElement): Form;
    }
    namespace Form {
        class Config {
            disableControls: boolean;
            successResponseHandler: (response: Response) => boolean;
            autoSubmitAllowed: boolean;
            actionUrl: Url | string;
        }
        type EventType = "submit" | "submitted";
        interface SubmitDirective {
            success?: () => any;
            error?: () => any;
            button?: Element;
        }
    }
    interface FormCallback {
        (form: Form): any;
    }
}
declare namespace Jhtml.Ui {
    class Link {
        private elem;
        private requestConfig;
        private dcr;
        disabled: boolean;
        constructor(elem: HTMLAnchorElement);
        private handle();
        readonly element: HTMLAnchorElement;
        dispose(): void;
        onDirective(callback: DirectiveCallback): void;
        offDirective(callback: DirectiveCallback): void;
        private static readonly KEY;
        static from(element: HTMLAnchorElement): Link;
    }
    interface DirectiveCallback {
        (directivePromise: Promise<Directive>): any;
    }
}
declare namespace Jhtml.Ui {
    class Scanner {
        static readonly A_ATTR: string;
        private static readonly A_SELECTOR;
        static readonly FORM_ATTR: string;
        private static readonly FORM_SELECTOR;
        static scan(elem: Element): void;
        static scanArray(elems: Array<Element>): void;
    }
}
declare namespace Jhtml.Util {
    class CallbackRegistry<C> {
        private callbacks;
        on(callback: C): void;
        onType(type: string, callback: C): void;
        off(callback: C): void;
        offType(type: string, callback: C): void;
        fire(...args: Array<any>): void;
        fireType(type: string, ...args: Array<any>): void;
        clear(): void;
    }
}
declare namespace Jhtml.Util {
    function closest(element: Element, selector: string, selfIncluded: boolean): Element;
    function getElemData(elem: Element, key: string): any;
    function bindElemData<T>(elem: Element, key: string, data: any): void;
    function findAndSelf(element: Element, selector: string): Element[];
    function find(nodeSelector: NodeSelector, selector: string): Array<Element>;
    function array(nodeList: NodeList): Array<Element>;
}
declare namespace Jhtml.Util {
    class ElemConfigReader {
        private element;
        constructor(element: Element);
        private buildName(key);
        readBoolean(key: string, fallback: boolean): boolean;
    }
}
