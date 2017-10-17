namespace Jhtml {
	
	export class DocumentManager {
		private CONTAINER_ATTR: string = "data-jhtml-container"
			
		private _containerElem: Element;
	
		constructor(public _document: Document) {
		}
		
		get document(): Document {
			return this._document;
		}
		
		get containerElem(): Element {
			if (!this._containerElem) {
				this._containerElem = this._document.querySelector("[" + this.CONTAINER_ATTR + "]");
			}
			
			return this._containerElem || null;
		}
		
		onDocumentReady(callback: () => any) {
			if (this._document.readyState === "complete") {
				callback();
			} else {
				this._document.addEventListener("DOMContentLoaded", callback, false);
			}
		}
		
//		replaceDocument(url: Url, text: string) {
//			this._document.open(url, name, features, replace)
//		}
		
		apply(model: Model) {
			if (model.headComplete) {
				this.clearHead();
			}

			this.dingsel(document.head, model.headElements);
			this.dingsel(document.body, model.bodyStartElements);
			this.dingsel(document.body, model.bodyEndElements);
		}
		
		private clearHead() {
			let elemsToRemove = new Array<Element>();
			
			let children = document.head.children;
			let length = children.length;
			for (let i in children) {
				if (children[i].tagName == "SCRIPT") continue;
					
				elemsToRemove.push(children[i]);
			}
			
			for (let elem of elemsToRemove) {
				document.head.removeChild(elem);
			}
		}
		
		private dingsel(container: Element, newElems: Array<Element>) {
			for (let elem of newElems) {
				switch (elem.tagName) {
				case "SCRIPT":
					if (!this.find(this._document, elem, ["src", "type"], true, false)) {
						this._document.body.appendChild(elem);
					}
					break;
				case "TITLE":
					{
						let oldElem: Element = null;
						if (oldElem = this.find(container, elem, [], false, false)) {
							oldElem.parentElement.replaceChild(elem, oldElem);
						}
						container.appendChild(elem);
					}
					break;
				case "STYLE":
				case "LINK":
				default:
					{
						let oldElem: Element = null;
						if (oldElem = this.findExact(this._document, elem)) {
							oldElem.parentElement.replaceChild(elem, oldElem);
						}
						container.appendChild(elem);
					}
				}
			}
		}
		
		private find(container: NodeSelector, newElem: Element, matchingAttrNames: Array<string>,
				checkInner: boolean, chekAttrNum: boolean): Element {
			
			let list = container.querySelectorAll(newElem.tagName);
			for (let i in list) {
				let elem = list.item(parseInt(i));
				
				if (this.compare(elem, newElem, matchingAttrNames, checkInner, chekAttrNum)) {
					return elem;
				}
			}
			
			return null;
		}
		
		private compare(elem1: Element, elem2: Element, attrNames: Array<string>, checkInner: boolean, 
				checkAttrNum: boolean): boolean {
			if (elem1.tagName !== elem2.tagName) return false;
			
			for (let attrName of attrNames) {
				if (elem1.getAttribute(attrName) !== elem2.getAttribute(attrName)) {
					return false;
				}
			}
			
			if (checkInner && elem1.innerHTML.trim() !== elem2.innerHTML.trim()) {
				return false;
			}
			
			if (checkAttrNum && elem1.attributes.length != elem2.attributes.length) {
				return false;
			} 
			
			return true;
		}
		
		private findExact(container: NodeSelector, newElem: Element): Element {
			let attrNames: Array<string> = [];
			let attrs = newElem.attributes;
			for (let i in attrs) {
				attrNames.push(attrs[i].name);
			}
			
			return this.find(container, newElem, attrNames, true, true);
		}
		
	}
}