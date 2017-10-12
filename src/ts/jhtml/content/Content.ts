namespace Jhtml {
	
	export class Content {
		private updater: Updater;
		private compHandlers: { [compName: string]: CompHandler } = {};
		
		constructor(private document: Document) {
			this.updater = new Updater(document);
		}
		
		handle(model: Model) {
			for (let comp of Object.values(model.comps)) {
				if (this.compHandlers[comp.name]
						&& this.compHandlers.hanldeComp(comp)) {
					continue;
				}
			}
		}
		
		registerCompHandler(compName: string, compHandler: CompHandler) {
			this.compHandlers[compName] = compHandler;
		}
		
		unregisterCompHandler(compName: string) {
			delete this.compHandlers[compName];
		}
	}
	
	export interface CompHandler {
		handleComp(comp: Comp, ajahDirective: AjahDirective): boolean;
	}
}