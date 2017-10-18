namespace Jhtml {
    
    export class Model {
	    public headElements: Array<Element> = [];
	    public bodyStartElements: Array<Element> = [];
	    public bodyEndElements: Array<Element> = [];
    	
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