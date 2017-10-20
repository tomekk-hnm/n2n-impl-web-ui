namespace Jhtml {
	
    export class Meta {
    
    	constructor(private rootElem: Element, private headElem: Element, private bodyElem: Element,
    			private containerElem: Element) {
    	}
    	
    	get headElements(): Array<Element> {
    		return Util.array(this.headElem.children);
    	}
    	
    	get bodyElements(): Array<Element> {
    		return Util.array(this.bodyElem.children);
    	}
    	
    	get containerElement(): Element {
    		return this.containerElem;
    	}
    	

		private processedElements : Array<Element>;
		private removableElems: Array<Element>;
    	private newMeta: Meta;
    	
		public replaceWith(newMeta: Meta) {
			this.processedElements = [];
			this.removableElems = [];
			this.newMeta = newMeta;

			this.mergeInto(newMeta.headElements, this.headElem, Meta.Target.HEAD);
			this.mergeInto(newMeta.bodyElements, this.headElem, Meta.Target.BODY);

			for (let removableElem of this.removableElems) {
				if (this.containsProcessed(removableElem)) continue;
				
				removableElem.remove();	
			}
			

			this.processedElements = null;
			this.removableElems = null;
			this.newMeta = null;
		}
    	
		private mergeInto(newElems: Array<Element>, parentElem: Element, target: Meta.Target) {
			let mergedElems: Array<Element> = [];
			let curElems = Util.array(parentElem.children);
			for (let i in newElems) {
				let newElem = newElems[i];
				
				let mergedElem = this.mergeElem(curElems, newElem, target);
				
				if (mergedElem === this.containerElem) continue;
				
				this.mergeInto(Util.array(newElem.children), mergedElem, target);
				
				mergedElems.push(mergedElem);
			}
			
			for (let i = 0; i < curElems.length; i++) {
				if (-1 < mergedElems.indexOf(curElems[i])) continue;
				
				this.removableElems.push(curElems[i]);
				curElems.splice(i, 1);
			}
			
			let curElem = curElems.shift();
			for (let i = 0; i < mergedElems.length; i++) {
				let mergedElem = mergedElems[i];
				
				if (mergedElem === curElem) {
					curElem = curElems.shift();
					continue;
				}
						
				if (!curElem) {
					parentElem.appendChild(mergedElem);
					continue;
				}
				
				parentElem.insertBefore(mergedElem, curElem);
				
				let j;
				if (-1 < (j = curElems.indexOf(mergedElem))) {
					curElems.splice(j, 1);
				}
			}
		}
		
		private mergeElem(preferedElems: Array<Element>, newElem: Element, target: Meta.Target): Element {
			if (newElem === this.newMeta.containerElem) {
				if (!this.compareExact(this.containerElem, newElem, false)) {
					let mergedElem =  <Element> newElem.cloneNode(false);
					this.processedElements.push(mergedElem);
					return mergedElem;
				}
				
				this.processedElements.push(this.containerElem);
				return this.containerElem;
			}
			
			if (newElem.contains(this.newMeta.containerElem)) {
				let mergedElem;
				if (mergedElem = this.filterExact(preferedElems, newElem, false)) {
					this.processedElements.push(mergedElem);
					return mergedElem;
				}
				
				return this.cloneNewElem(newElem, false);
			}
			
			let mergedElem: Element;
			
			switch (newElem.tagName) {
				case "SCRIPT":
					if ((mergedElem = this.filter(preferedElems, newElem, ["src", "type"], true, false))
							|| (mergedElem = this.find(newElem, ["src", "type"], true, false))) {
						this.processedElements.push(mergedElem);
						return mergedElem;
					}
					
					return this.cloneNewElem(newElem, true);
				case "STYLE":
				case "LINK":
					if ((mergedElem = this.filterExact(preferedElems, newElem, true))
							|| (mergedElem = this.findExact(newElem, true))) {
						this.processedElements.push(mergedElem);
						return mergedElem;
					}
					
					return this.cloneNewElem(newElem, true);
				default:
					if ((mergedElem = this.filterExact(preferedElems, newElem, true))
							|| (mergedElem = this.findExact(newElem, true, target))) {
						this.processedElements.push(mergedElem);
						return mergedElem;
					}
				
					return this.cloneNewElem(newElem, false);
			}
			
			
		}
		
		private cloneNewElem(newElem: Element, deep: boolean): Element {
			let mergedElem = <Element> newElem.cloneNode(deep);
			this.processedElements.push(mergedElem);
			return mergedElem;
		}
		
		private attrNames(elem: Element): Array<string> {
			let attrNames: Array<string> = [];
			let attrs = elem.attributes;
			for (let i = 0; i < attrs.length; i++) {
				attrNames.push(attrs[i].nodeName);
			}
			return attrNames;
		}
    	
		private findExact(matchingElem: Element, checkInner: boolean,
				target: Meta.Target = Meta.Target.HEAD|Meta.Target.BODY): Element {
			
			return this.find(matchingElem, this.attrNames(matchingElem), checkInner, true, target);
		}
		
		private find(matchingElem: Element, matchingAttrNames: Array<string>, checkInner: boolean, 
				checkAttrNum: boolean, target: Meta.Target = Meta.Target.HEAD|Meta.Target.BODY): Element {
			let foundElem = null;
			
			if ((target & Meta.Target.HEAD) 
					&& (foundElem = this.findIn(this.headElem, matchingElem, matchingAttrNames, checkInner, checkAttrNum))) {
				return foundElem;
			}
			
			if ((target & Meta.Target.BODY) 
					&& (foundElem = this.findIn(this.bodyElem, matchingElem, matchingAttrNames, checkInner, checkAttrNum))) {
				return foundElem;
			}
			
			return null;
		}
    	
		private findIn(nodeSelector: NodeSelector, matchingElem: Element, matchingAttrNames: Array<string>,
    			checkInner: boolean, chekAttrNum: boolean): Element {
    		for (let tagElem of Util.find(nodeSelector, matchingElem.tagName)) {
    			if (tagElem === this.containerElem  || tagElem.contains(this.containerElem)
    					|| this.containerElem.contains(tagElem) || this.containsProcessed(tagElem)) {
    				continue;
    			}
    			
    			if (this.compare(tagElem, matchingElem, matchingAttrNames, checkInner, chekAttrNum)) {
					return tagElem;
				}
    		}
    			
    		return null;
		}
    	
		private filterExact(elems: Array<Element>, matchingElem: Element, checkInner: boolean): Element {
			return this.filter(elems, matchingElem, this.attrNames(matchingElem), checkInner, true);
		}
		
		private containsProcessed(elem: Element): boolean {
			return -1 < this.processedElements.indexOf(elem);
		}
		
		private filter(elems: Array<Element>, matchingElem: Element, attrNames: Array<string>, checkInner: boolean, 
				checkAttrNum: boolean): Element {
			for (let elem of elems) {
				if (!this.containsProcessed(elem)
						&& this.compare(elem, matchingElem, attrNames, checkInner, checkAttrNum)) {
					return elem;
				}
			}
		}
		
    	private compareExact(elem1: Element, elem2: Element, checkInner: boolean): boolean {
    		return this.compare(elem1, elem2, this.attrNames(elem1), checkInner, true);
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
    		HEAD = 1,
    		BODY = 2
    	}
    }    
}