namespace Jhtml {
    export class Page {
    	private _loaded: boolean = false;
    	
    	constructor(private _url: Url, public promise: Promise<Directive>) {
    		promise.then(() => {
    			this._loaded = true;
    		})
    	}
    	
    	get loaded(): boolean {
    		return this._loaded;
    	}
    	
    	get url(): Url {
    		return this._url;
    	}
    	
    	dispose() {
    		this.promise = null;
    	}
    	
    	get disposed(): boolean {
    		return this.promise ? false : true;
    	}
    }
}