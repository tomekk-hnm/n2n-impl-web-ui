namespace Jhtml {
	
	export class Context {
		private updater: Updater;
		private compHandlers: { [compName: string]: CompHandler } = {};
		private readyCallbacks: Util.CallbackRegistry<ReadyCallback> = new Util.CallbackRegistry<ReadyCallback>(); 
		public monitor: Monitor = null;
		
		constructor(private document: Document) {
			this.updater = new Updater(document);
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
			
			if (this.document.readyState === "complete") {
				readyCallback(this.document.body.childNodes);
			} else {
				this.document.addEventListener( "DOMContentLoaded", () => {
					readyCallback(this.document.body.childNodes);
				}, false );
			}
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