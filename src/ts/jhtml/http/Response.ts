namespace Jhtml {
    
    interface class Response {
        
        getUrl(): Jhtml.Url;
    }
    
    class OkResponse {
    	
    	constructor(public url: Url)
    	
    	getUrl(): Jhtml.Url {
    		return this.url;
    	}
    }
    
    class ErrResponse {
    	constructor (public status: number, public responseText: string) {
    		
    	}
    }
}