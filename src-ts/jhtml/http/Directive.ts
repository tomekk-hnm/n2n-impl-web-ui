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
    	constructor(public srcUrl: Url, public back: RedirectDirective.Type, public targetUrl: Url, 
    			public requestConfig?: RequestConfig, public additionalData?: any) {
    	}
    	
    	getAdditionalData(): any {
        	return this.additionalData;
        }
        
    	exec(monitor: Monitor) {
            switch (this.back) {
            case RedirectDirective.Type.REFERER:
                if (!monitor.history.currentPage.url.equals(this.srcUrl)) {
                	return;
                }
            case RedirectDirective.Type.BACK:
                if (monitor.history.currentEntry.index > 0) {
                	let entry = monitor.history.getEntryByIndex(monitor.history.currentEntry.index - 1);
                	monitor.exec(entry.page.url, this.requestConfig);
                	monitor.history.currentEntry.scrollPos = entry.scrollPos;
                	return;
                } 
            default:
                monitor.exec(this.targetUrl, this.requestConfig);
            }
        }
    }
    
    export namespace RedirectDirective {
        export enum Type {
            TARGET, REFERER, BACK 
        }
    }
    
}