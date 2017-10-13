namespace Jhtml {
	
	export class Context {
		private manager: ContentManager;
		private containerElem: Element;
		private compHandlers: { [compName: string]: CompHandler } = {};
		private readyCallbacks: Util.CallbackRegistry<ReadyCallback> = new Util.CallbackRegistry<ReadyCallback>();
		
		public monitor: Monitor = null;
		
		constructor(document: Document) {
			this.manager = new ContentManager(document);
		}
		
		get contentManager(): ContentManager {
			return this.contentManager;
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
		
		static test(document: Document): Context|null {
			let content: any = document.body['data-jhtml-content'].jhtmlContent;
			if (content instanceof Context) {
				return content;
			}
			return null;
		}
		
		static from(document: Document): Context {
			let content = Context.test(document)
			if (content) return content;
			
			document.body['data-jhtml-content'] = content = new Context(document);
			return content;
		}
	}
	
	export interface CompHandler {
		handleComp(comp: Comp): boolean;
	}
	
	export interface ReadyCallback {
		(Element, Comp?): any;
	}
}