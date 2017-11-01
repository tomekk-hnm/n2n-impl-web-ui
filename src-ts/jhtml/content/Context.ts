namespace Jhtml {
	
	export class Context {
		private _requestor: Requestor;
		private modelState: ModelState;
	
		private compHandlers: { [compName: string]: CompHandler } = {};
		private readyCbr: Util.CallbackRegistry<ReadyCallback> = new Util.CallbackRegistry<ReadyCallback>();
		
		constructor(private _document: Document) {
			this._requestor = new Requestor(this);
			
			this.document.addEventListener("DOMContentLoaded", () => {
				this.readyCbr.fire(this.document.documentElement, {});
			}, false);
		}
		
		get requestor(): Requestor {
			return this._requestor;
		}
		
		get document(): Document {
			return this._document;
		}
		
		isJhtml(): boolean {
			return this.getModelState(false) ? true : false;
		}
		
		private getModelState(required: boolean): ModelState {
			if (!this.modelState) {
				try {
					this.modelState = ModelFactory.createStateFromDocument(this.document);
					Ui.Scanner.scan(this.document.documentElement);
				} catch (e) { 
					if (e instanceof ParseError) return null;
					
					throw e;
				}
			}
			
			if (!this.modelState && required) {
				throw new Error("No jhtml context");
			}
			
			return this.modelState || null;
		}
		
		import(newModel: Model, montiorCompHandlers: { [compName: string]: CompHandler } = {}) {
			let boundModelState: ModelState = this.getModelState(true);
			
			for (let name in boundModelState.comps) {
				let comp = boundModelState.comps[name];
				
				if (!(montiorCompHandlers[name] && montiorCompHandlers[name].detachComp(comp))
						&& !(this.compHandlers[name] && this.compHandlers[name].detachComp(comp))) {
					comp.detach();
				}
			}

			boundModelState.container.detach();
			boundModelState.metaState.replaceWith(newModel.meta);
			
			if (!boundModelState.container.matches(newModel.container)) {
				boundModelState.container = newModel.container;
			} 

			boundModelState.container.attachTo(boundModelState.metaState.containerElement);
			
			for (let name in newModel.comps) {
				let comp = boundModelState.comps[name] = newModel.comps[name];
				
				if (!(montiorCompHandlers[name] && montiorCompHandlers[name].attachComp(comp))
						&& !(this.compHandlers[name] && this.compHandlers[name].attachComp(comp))) {
					comp.attachTo(boundModelState.container.compElements[name]);
				}
			}
		}
		
		importMeta(meta: Meta) {
			let boundModelState = this.getModelState(true);
			
			boundModelState.metaState.import(meta);
		}
		
		registerNewModel(model: Model) {
			let container = model.container;
			if (container) {
				let containerReadyCallback = () => {
					container.off("attached", containerReadyCallback)
					this.readyCbr.fire(container.elements, { container: container });
					Ui.Scanner.scanArray(container.elements);
				};
				container.on("attached", containerReadyCallback);
			}
			
			for (let comp of Object.values(model.comps)) {
				let compReadyCallback = () => {
					comp.off("attached", compReadyCallback);
					this.readyCbr.fire(comp.elements, { comp: Comp });
					Ui.Scanner.scanArray(comp.elements);
				};
				comp.on("attached", compReadyCallback);
			}
			
			let snippet = model.snippet;
			if (snippet) {
				let snippetReadyCallback = () => {
					snippet.off("attached", snippetReadyCallback)
					this.importMeta(model.meta);
					this.readyCbr.fire(snippet.elements, { snippet: snippet });
					Ui.Scanner.scanArray(snippet.elements);
				};
				snippet.on("attached", snippetReadyCallback);
			}
		}
		
		replace(text: string, mimeType: string, replace: boolean) {
			this.document.open(mimeType, replace? "replace" : null);
			this.document.write(text);
			this.document.close();
		}
		
		registerCompHandler(compName: string, compHandler: CompHandler) {
			this.compHandlers[compName] = compHandler;
		}
		
		unregisterCompHandler(compName: string) {
			delete this.compHandlers[compName];
		}
		
		onReady(readyCallback: ReadyCallback) {
			this.readyCbr.on(readyCallback);
			
			if (this._document.readyState === "complete") {
				readyCallback([this.document.documentElement], {});	
			}
		}
		
		offReady(readyCallback: ReadyCallback) {
			this.readyCbr.off(readyCallback);
		}
		
		private static KEY: string = "data-jhtml-context";
		
		static test(document: Document): Context|null {
			let context: any = Util.getElemData(document.documentElement, Context.KEY);
			if (context instanceof Context) {
				return context;
			}
			return null;
		}
		
		static from(document: Document): Context {
			let context = Context.test(document)
			if (context) return context;
			
			Util.bindElemData(document.documentElement, Context.KEY, context = new Context(document));
			return context;
		}
	}
	
	export interface CompHandler {
		attachComp(comp: Comp): boolean;
		
		detachComp(comp: Comp): boolean;
	}
	
	export interface CompHandlerReg {
		[compName: string]: CompHandler
	}
	
	export interface ReadyCallback {
		(elements: Array<Element>, event: ReadyEvent ): any;
	}
	
	export interface ReadyEvent {
		container?: Container;
		comp?: Comp;
		snippet?: Snippet;
	}
}