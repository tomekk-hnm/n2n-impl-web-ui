namespace Jhtml {
	
	export interface Directive {
		
		getModel(): Model|null;
		
		exec(context: Context, history: History, compHandlerReg: CompHandlerReg);
	}
    
    export class FullModelDirective implements Directive {
    	constructor(private model: Model) {
    		if (!model.isFull()) {
    			throw new Error("Invalid argument. Full model required.")
    		}
    	}
    	
    	getModel(): Model|null {
    		return this.model;
    	}
    	
    	exec(context: Context, history: History, compHandlerReg: CompHandlerReg) {
    		context.import(this.model, compHandlerReg);
    	}
    }
    
    export class ReplaceDirective implements Directive {
        constructor(public status: number, public responseText: string, public mimeType: string, public url: Url) {
        }
    	
        getModel(): Model|null {
        	return null;
        }
        
        exec(context: Context, history: History) {
        	context.replace(this.responseText, this.mimeType, history.currentPage.url.equals(this.url));
        }
    }
    
}