namespace Jhtml {
	
	export class Context {
		private _requestor: Requestor;
		private _boundModel: Model;
	
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
			return this.getBoundModel() ? true : false;
		}
		
		private getBoundModel(): Model {
			if (!this._boundModel) {
				try {
					this._boundModel = ModelFactory.createFromDocument(this._document);
				} catch (e) { }
			}
			
			return this._boundModel || null;
		}
		
		import(model: Model) {
			let boundModel: Model = this.getBoundModel();
			if (!boundModel) {
				throw new Error("No jhtml context");
			}
			
			boundModel.meta.replaceWith(model.meta);
			
			for (let name in boundModel.comps) {
				boundModel.comps[name].detach();
			}
			
			if (!boundModel.container.matches(model.container)) {
				boundModel.container.detach();
				model.container.attachTo(boundModel.meta.containerElement);
				boundModel.container = model.container;
			}
			
			for (let name in model.comps) {
				model.comps[name].attachTo(boundModel.container.compElements[name]);
			}
		}
		
		registerNewModel(model: Model) {
			let container = model.container;
			let containerReadyCallback = () => {
				container.off("attached", containerReadyCallback)
				this.readyCbr.fire(container.attachedElement, { container: container });
			};
			container.on("attached", containerReadyCallback);
			
			for (let comp of Object.values(model.comps)) {
				let compReadyCallback = () => {
					comp.off("attached", containerReadyCallback);
					this.readyCbr.fire(comp.attachedElement, { comp: Comp });
				};
				comp.on("attached", containerReadyCallback);
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
				readyCallback(this.document.documentElement, {});	
			}
		}
		
		offReady(readyCallback: ReadyCallback) {
			this.readyCbr.off(readyCallback);
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
		(element: Element, event: ReadyEvent ): any;
	}
	
	export interface ReadyEvent {
		container?: Container;
		comp?: Comp;
	}
}