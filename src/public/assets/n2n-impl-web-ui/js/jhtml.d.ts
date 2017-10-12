declare namespace Jhtml {
    function holeradio(): void;
}
declare namespace Jhtml {
    class Monitor {
    }
}
declare namespace Jhtml {
    class Browser {
        private window;
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
        (index: number, context: Response): any;
    }
}
declare namespace Jhtml {
    class Requester {
        constructor();
        exec(url: Url): Promise<Response>;
        private createResponse(url, responseText);
    }
}
declare namespace Jhtml {
}
declare namespace Jhtml {
    class ResponseFactory {
        static createResponse(url: Url, jsonObj: any): Response;
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
declare namespace Jhtml {
    class Model {
        protected headComplete: boolean;
        protected headElements: Array<Element>;
        protected bodyStartElements: Array<Element>;
        protected bodyEndElements: Array<Element>;
        protected compElements: {
            [name: string]: Element;
        };
        static createFromJsonObj(jsonObj: any): Model;
        private static compileContent(model, jsonObj);
        private static compileElements(elements, name, jsonObj);
        private static createElement(elemHtml);
    }
}
