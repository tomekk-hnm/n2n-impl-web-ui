namespace Jhtml {
    
    export class Model {
	    public meta: Meta;
    	
    	public containerRootElem: Element;
    	public container: Container;
    	public comps: { [name: string]: Comp } = {} 
    	
    }
    
    export class Container {
    	constructor(public name: string, public element: Element) {
    	}
    }
    
    export class Comp {
    	constructor(public name: string, public element: Element, public model: Model) {
    	}
    }
}