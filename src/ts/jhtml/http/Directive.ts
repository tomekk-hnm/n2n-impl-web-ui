namespace Jhtml {
	
	export interface Directive {
		
		exec(context: Context, history: History);
	}
    
    export class ModelDirective implements Directive {
    	constructor(public model: Model) {
    	}
    	
    	exec(context: Context, history: History) {
    		context.import(this.model);
    	}
    }
    
    export class ReplaceDirective implements Directive {
        constructor(public status: number, public responseText: string) {
        }
    	
        exec(context: Context, history: History) {
        }
    }
    
}