namespace Jhtml {
    
    export class Response {
        
        constructor(private _url: Jhtml.Url) {
        }
        
        get url(): Jhtml.Url {
            return this._url;
        }
    }
}