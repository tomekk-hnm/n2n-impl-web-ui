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
    class Comp {
        name: string;
        constructor(name: string);
    }
}
declare namespace Jhtml {
    class Requester {
        constructor();
        exec(url: Url): Promise<Response>;
    }
}
declare namespace Jhtml {
    class Response {
        private _url;
        constructor(_url: Jhtml.Url);
        readonly url: Jhtml.Url;
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
