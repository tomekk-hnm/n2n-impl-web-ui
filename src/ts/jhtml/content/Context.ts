namespace Jhtml {
	
	export class Context {
		private manager: ContentManager;
		private _requestor: Requestor;
	
		private containerElem: Element;
		private compHandlers: { [compName: string]: CompHandler } = {};
		private readyCallbacks: Util.CallbackRegistry<ReadyCallback> = new Util.CallbackRegistry<ReadyCallback>();
		
		
		constructor(document: Document) {
			this.manager = new ContentManager(document);
			this._requestor = new Requestor();
		}
		
		get contentManager(): ContentManager {
			return this.manager;
		}
		
		get requestor(): Requestor {
			return this._requestor;
		}
		
		handle(model: Model) {
			for (let comp of Object.values(model.comps)) {
				if (this.compHandlers[comp.name]
						&& this.compHandlers[comp.name].handleComp(comp)) {
					continue;
				}
				
				// handle comp
				this.readyCallbacks.trigger(comp.element.childNodes, comp);
			}
		}
		
		registerCompHandler(compName: string, compHandler: CompHandler) {
			this.compHandlers[compName] = compHandler;
		}
		
		unregisterCompHandler(compName: string) {
			delete this.compHandlers[compName];
		}
		
		onReady(readyCallback: ReadyCallback) {
			this.readyCallbacks.on(readyCallback);
			
			this.manager.onDocumentReady(() => {
				readyCallback(this.manager.document.body.childNodes);
			});
		}
		
		offReady(readyCallback: ReadyCallback) {
			this.readyCallbacks.off(readyCallback);
		}
		
		private static KEY: string = "data-jhtml-context";
		
		static test(document: Document): Context|null {
			let context: any = Util.getElemData(document.body, Context.KEY);
			if (context instanceof Context) {
				return context;
			}
			return null;
		}
		
		static from(document: Document): Context {
			let context = Context.test(document)
			if (context) return context;
			
			Util.bindElemData(document.body, Context.KEY, context = new Context(document));
			return context;
		}
	}
	
	export interface CompHandler {
		handleComp(comp: Comp): boolean;
	}
	
	export interface ReadyCallback {
		(Element, Comp?): any;
	}
}