namespace Jhtml {
    
    export class Response {
    	constructor(public url: Url, public status: number, public text: string,
    			public ajahDirective: AjahDirective = null) {
    	}
    }
    
    export class AjahDirective {
        constructor(public model: Model = null) {
        }
    	
        exec() {
        }
    }
    
}