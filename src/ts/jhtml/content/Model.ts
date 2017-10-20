namespace Jhtml {
    
    export class Model {
    	constructor(public meta: Meta) {
    	}
	    
    	public container: Container;
    	public comps: { [name: string]: Comp } = {} 
    }
}