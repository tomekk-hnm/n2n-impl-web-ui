namespace Jhtml {
	
	export class DocumentManager {
		private CONTAINER_ATTR: string = "data-jhtml-container"
			
		private _currentModel: Model;
	
		constructor(public _document: Document) {
		}
		
		get document(): Document {
			return this._document;
		}
		
		get currentModel(): Model {
			if (!this._currentModel) {
				try {
					this._currentModel = ModelFactory.createFromDocument(this._document);
				} catch (e) { }
			}
			
			return this._currentModel || null;
		}
		
		onDocumentReady(callback: () => any) {
			if (this._document.readyState === "complete") {
				callback();
			} else {
				this._document.addEventListener("DOMContentLoaded", callback, false);
			}
		}
		
		import(model: Model) {
			this.currentModel.import(model);
		}
		
	}
}