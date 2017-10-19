namespace Jhtml {
    
    export class Model {
    	constructor(public meta: Meta) {
    	}
	    
    	public container: Container;
    	public comps: { [name: string]: Comp } = {} 
    }
    
    export abstract class Content {
    	private detachedElem: Element;
    	private cbr: Util.CallbackRegistry<() => any> = new Util.CallbackRegistry<() => any>();
    	
    	constructor(private _name: string, private _attachedElem: Element) {
    		this.detachedElem = _attachedElem.ownerDocument.createElement("template");
    	}
    	
    	get name(): string {
    		return this._name;
    	}
    	
    	on(eventType: Content.EventType, callback: () => any) {
    		this.cbr.onType(eventType, callback);
    	}
    	
    	off(eventType: Content.EventType, callback: () => any) {
    		this.cbr.offType(eventType, callback);
    	}
    	
    	get attachedElement(): Element {
    		return this._attachedElem;
    	}
    	
    	attachTo(element: Element) {
    		if (this._attachedElem) {
    			throw new Error("Element already attached.");
    		}
    		
    		this._attachedElem = element;
    		
    		let list = this.detachedElem.children;
    		for (let i in list) {
    			element.appendChild(list[i]);
    		}
    		
    		this.cbr.fireType("attached");
    	} 
    	
    	get attached(): boolean {
    		return this._attachedElem ? true : false;
    	}
    	
    	detach() {
    		if (!this._attachedElem) return;
    		
    		let list = this._attachedElem.children;
    		for (let i in list) {
    			this.detachedElem.appendChild(list[i]);
    		}
    		
    		this.cbr.fireType("detached");
    	}
    	
    	dispose() {
    		if (this.attached) {
    			this.detach();
    		}
    		
    		this.cbr.fireType("dispose");
    		
    		this.cbr = null;
    		this.detachedElem.remove();
    		this.detachedElem = null;
    		
    	}
    }
    
    export namespace Content {
    	export type EventType = "attached" | "detach" | "dispose";
    }

    export class Container extends Content {
    	public compElements: { [name: string]: Element } = {};
    	
    	matches(container: Container): boolean {
    		return this.name == container.name 
    				&& JSON.stringify(Object.keys(this.compElements)) != JSON.stringify(Object.keys(container.compElements));
    	}
    }
    
    export class Comp extends Content {
    }
}