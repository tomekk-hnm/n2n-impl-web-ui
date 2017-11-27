namespace Jhtml {
    export class Page {
    	private _loaded: boolean = false;
    	private _config = new Page.Config();
    
    	constructor(private _url: Url, public promise: Promise<Directive>|null) {
    		if (promise) {
	    		promise.then(() => {
	    			this._loaded = true;
	    		});
    		}
    	}
    	
    	get config(): Page.Config {
    		return this._config;
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
    
    export namespace Page {
    	export class Config {
    		frozen: boolean = false;
    		keep: boolean = false;
    	}
    }
}