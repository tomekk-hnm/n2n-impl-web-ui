namespace Jhtml {

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
    		for (let childElem of Util.array(this.detachedElem.children)) {
    			element.appendChild(childElem);
    		}
    		this.cbr.fireType("attached");
    	} 
    	
    	get attached(): boolean {
    		return this._attachedElem ? true : false;
    	}
    	
    	detach() {
    		if (!this._attachedElem) return;
    		
    		this.cbr.fireType("detach");
    		
    		for (let childElem of Util.array(this._attachedElem.children)) {
    			this.detachedElem.appendChild(childElem);
    		}
    		
    		this._attachedElem = null;
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