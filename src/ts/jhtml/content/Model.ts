namespace Jhtml {
    
    export class Model {
    	constructor(public meta: Meta) {
    	}
	    
    	public response: Response|null
    	public container: Container;
    	public comps: { [name: string]: Comp } = {};
    	public snippet: Snippet;
    	
    }
}