namespace Jhtml {
    
    export class Model {
    	
	    public meta: Meta;
    	
    	public containerRootElem: Element;
    	public container: Container;
    	public comps: { [name: string]: Comp } = {} 
    }
    
    export abstract class Content {
    	private cbr: Util.CallbackRegistry<() => any> = new Util.CallbackRegistry<() => any>();
    	
    	constructor(private name: string, private detachedElement: Element,
    			private attachedElement: Element = null) {
    	}
    	
    	on(eventType: Content.EventType, callback: () => any) {
    		this.cbr.onType(eventType, callback);
    	}
    	
    	off(eventType: Content.EventType, callback: () => any) {
    		this.cbr.offType(eventType, callback);
    	}
    	
    	attachTo(element: Element) {
    		if (this.attachedElement) {
    			throw new Error("Element already attached.");
    		}
    		
    		this.attachedElement = element;
    		
    		let list = this.detachedElement.children;
    		for (let i in list) {
    			element.appendChild(list[i]);
    		}
    		
    		this.cbr.triggerType("attached");
    	} 
    	
    	get attached(): boolean {
    		return this.attachedElement ? true : false;
    	}
    	
    	detach() {
    		if (!this.attachedElement) return;
    		
    		let list = this.attachedElement.children;
    		for (let i in list) {
    			this.detachedElement.appendChild(list[i]);
    		}
    		
    		this.cbr.triggerType("detached");
    	}
    	
    	dispose() {
    		if (this.attached) {
    			this.detach();
    		}
    		
    		this.cbr.triggerType("dispose");
    		
    		this.cbr = null;
    		this.detachedElement.remove();
    		this.detachedElement = null;
    		
    	}
    }
    
    export namespace Content {
    	export type EventType = "attached" | "detach" | "inserted" | "dispose";
    }
    
    export class Container extends Content {
    }
    
    export class Comp extends Content {
    }
}