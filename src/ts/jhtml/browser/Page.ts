namespace Jhtml {
    export class Page {
    	constructor(private _url: Url, public promise: Promise<Response>) {
    	}
    	
    	get url(): Url {
    		return this._url;
    	}
    }
}