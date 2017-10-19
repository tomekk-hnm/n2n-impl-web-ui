namespace Jhtml {
	
    export class Meta {
    
    	constructor(private rootElem: Element, private headElem: Element, private bodyElem: Element,
    			private containerElem: Element) {
    	}
    	
    	get headElements(): Array<Element> {
    		return Object.values(this.headElem.children);
    	}
    	
    	get bodyElements(): Array<Element> {
    		return Object.values(this.bodyElem.children);
    	}
    	
    	get containerElement(): Element {
    		return this.containerElem;
    	}
    	
    	private mergedHeadElems: Array<Element>;
    	private mergedBodyElems: Array<Element>;
    	private mergedContainerElem: Element;
    	private newMeta: Meta;
    	
		public replaceWith(newMeta: Meta) {
			this.mergedHeadElems = [];
			this.mergedBodyElems = [];
			this.newMeta = newMeta;
		
			for (let newElem of newMeta.headElements) {
				this.mergedHeadElems.push(this.mergeElem(newElem, Meta.Target.HEAD));
			}
			
			for (let newElem of newMeta.bodyElements) {
				this.mergedHeadElems.push(this.mergeElem(newElem, Meta.Target.HEAD));
			}

			this.clean(this.headElem);
			this.clean(this.bodyElem);
			
			for (let elem of this.mergedHeadElems) {
				this.headElem.appendChild(elem);
			}
			
			for (let elem of this.mergedBodyElems) {
				this.headElem.appendChild(elem);
			}
			
			this.mergedHeadElems = null;
			this.mergedBodyElems = null;
			this.newMeta = null;
		}			
		
		private clean(metaElem: Element) {
			let list = metaElem.children;
			for (let i in list) {
				let elem = list[i];
				
				if (elem.tagName == "SCRIPT" || -1 < this.mergedHeadElems.indexOf(elem) 
						|| -1 < this.mergedBodyElems.indexOf(elem)) {
					continue;
				}
				
				let scriptElemList = elem.querySelectorAll("script");
				for (let i in scriptElemList) {
					metaElem.insertBefore(scriptElemList[i], elem);
				}
				metaElem.removeChild(elem);
			}
		}
		
		private mergeElem(newElem: Element, target: Meta.Target): Element {
			if (newElem === this.newMeta.containerElem) {
				return this.mergedContainerElem = <Element> newElem.cloneNode(false);
			}
			
			if (!newElem.contains(this.newMeta.containerElem)) {
				switch (newElem.tagName) {
					case "SCRIPT":
						for (let curElem of this.find(newElem, ["src", "type"], true, false)) {
							return curElem;
						}
						return <Element> newElem.cloneNode();
					case "STYLE":
					case "LINK":
						for (let curElem of this.findExact(newElem)) {
							return curElem;
						}
						return <Element> newElem.cloneNode();
					default:
						for (let curElem of this.findExact(newElem, target)) {
							return curElem;
						}
					
				}
			}
			
    		let mergedElem = newElem.cloneNode(false);
    		for (let i in newElem.children) {
    			mergedElem.appendChild(this.mergeElem(newElem.children[i], target));
    		}
		}
    	
		private findExact(matchingElem: Element, 
				target: Meta.Target = Meta.Target.HEAD|Meta.Target.BODY): Array<Element> {
			let attrNames: Array<string> = [];
			let attrs = matchingElem.attributes;
			for (let i in attrs) {
				attrNames.push(attrs[i].name);
			}
			
			return this.find(matchingElem, attrNames, true, true, target);
		}
		
		private find(matchingElem: Element, matchingAttrNames: Array<string>, checkInner: boolean, 
				checkAttrNum: boolean, target: Meta.Target = Meta.Target.HEAD|Meta.Target.BODY): Array<Element> {
			let foundElem = null;
			
			if ((target & Meta.Target.HEAD) 
					&& (foundElem = this.filter(this.headElem, matchingElem, matchingAttrNames, checkInner, checkAttrNum))) {
				return foundElem;
			}
			
			if ((target & Meta.Target.BODY) 
					&& (foundElem = this.filter(this.bodyElem, matchingElem, matchingAttrNames, checkInner, checkAttrNum))) {
				return foundElem;
			}
			
			return null;
		}
    	
    	private filter(nodeSelector: NodeSelector, matchingElem: Element, matchingAttrNames: Array<string>,
    			checkInner: boolean, chekAttrNum: boolean): Element {
    		let tagElemList = nodeSelector.querySelectorAll(matchingElem.tagName);
    		for (let i in tagElemList) {
    			let tagElem = tagElemList.item(parseInt(i));
    			
    			if (tagElem === this.containerElem  || tagElem.contains(this.containerElem)
    					|| this.containerElem.contains(tagElem) || -1 < this.mergedHeadElems.indexOf(tagElem) 
    					|| -1 < this.mergedBodyElems.indexOf(tagElem)) {
    				continue;
    			}
    			
    			if (this.compare(tagElem, matchingElem, matchingAttrNames, checkInner, chekAttrNum)) {
					return tagElem;
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
    }
    
    export namespace Meta {
    	export enum Target {
    		HEAD,
    		BODY
    	}
    }    
}