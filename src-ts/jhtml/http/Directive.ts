namespace Jhtml {
	
	export interface Directive {
		
		getAdditionalData(): any;
		
		exec(monitor: Monitor);
	}
    
    export class FullModelDirective implements Directive {
    	constructor(private model: Model) {
    		if (!model.isFull()) {
    			throw new Error("Invalid argument. Full model required.")
    		}
    	}
    	
    	getAdditionalData(): any {
    		return this.model.additionalData;
    	}
    	
    	exec(monitor: Monitor) {
    		monitor.context.import(this.model, monitor.compHandlerReg);
    	}
    }
    
    export class ReplaceDirective implements Directive {
        constructor(public status: number, public responseText: string, public mimeType: string, public url: Url) {
        }
    	
        getAdditionalData(): any {
        	return null;
        }
        
        exec(monitor: Monitor) {
        	monitor.context.replace(this.responseText, this.mimeType, 
        			monitor.history.currentPage.url.equals(this.url));
        }
    }
    
    export class RedirectDirective {
    	constructor(public back: boolean, public url: Url, public requestConfig?: RequestConfig, 
    			public additionalData?: any) {
    	}
    	
    	getAdditionalData(): any {
        	return this.additionalData;
        }
        
        exec(monitor: Monitor) {
        	if (this.back && !monitor.history.currentPage.url.equals(this.url)) return;
        	
        	monitor.exec(this.url, this.requestConfig);
        }
    }
    
}