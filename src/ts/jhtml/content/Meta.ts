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
    	
    	private mergedHeadElems: Array<Element>;
    	private mergedBodyElems: Array<Element>;
    	private mergedContainerElem: Element;
    	private newMeta: Meta;
    	
		public replaceWith(newMeta: Meta) {
			this.untouchableElems = [];
			this.mergedHeadElems = [];
			this.mergedBodyElems = [];
			this.mergedContainerElem = null;
			this.newMeta = newMeta;
		
			for (let newElem of newMeta.headElements) {
				this.mergedHeadElems.push(this.mergeElem(newElem, Meta.Target.HEAD));
			}
			
			for (let newElem of newMeta.bodyElements) {
				this.mergedBodyElems.push(this.mergeElem(newElem, Meta.Target.BODY));
			}

			let untouchedHeadElems = this.clean(this.headElem);
			for (let elem of this.mergedHeadElems) {
				this.headElem.appendChild(elem);
			}
			
			this.clean(this.bodyElem);
			
			for (let elem of this.mergedBodyElems) {
				this.bodyElem.appendChild(elem);
			}
			
			this.containerElem = this.mergedContainerElem;

			this.untouchedElems = null;
			this.mergedHeadElems = null;
			this.mergedBodyElems = null;
			this.mergedContainerElem = null;
			this.newMeta = null;
		}			
		

		private untouchedElems : Array<Element>;
		private removableElems: Array<Element>;
    	
		private mergeInto(newElems: Array<Element>, parentElem: Element, target: Meta.Target) {
			for (let i in newElems) {
				let curElem = parentElem.children[i];
				
				this.mergeElem(newElem, target)
				this.compare(elem1, elem2, attrNames, checkInner, checkAttrNum)
			}
		}
		
		private clean(metaElem: Element): Array<Element> {
			let untouchedElems: Array<Element> = [];
			for (let elem of Util.array(metaElem.children)) {
				if (elem.tagName == "SCRIPT" || -1 < this.mergedHeadElems.indexOf(elem) 
						|| -1 < this.mergedBodyElems.indexOf(elem)) {
					untouchedElems.push(elem);
					continue;
				}
				
				for (let scriptElem of Util.find(elem, "script")) {
					metaElem.insertBefore(scriptElem, elem);
				}
				metaElem.removeChild(elem);
			}
			return untouchedElems;
		}
		
		private mergedElem(preferedCurElems: Array<Element>, newElem: Element, target: Meta.Target): Element {
			if (newElem === this.newMeta.containerElem) {
				if (!this.compareExact(this.containerElem, newElem, false)) {
					let mergedElem =  <Element> newElem.cloneNode(false);
					this.processedElements.push(mergedElem);
					return mergedElem;
				}
				
				let index = preferedCurElems.indexOf(this.containerElem);
				if (-1 < index) preferedCurElems.splice(index, 1);
					
				this.processedElements.push(this.containerElem);
				return this.containerElem;

			}
			
			if (!newElem.contains(this.newMeta.containerElem)) {
				let curElem;
				
				switch (newElem.tagName) {
					case "SCRIPT":
						if (curElem = this.find(newElem, ["src", "type"], true, false)) {
							return curElem;
						}
						return <Element> newElem.cloneNode();
					case "STYLE":
					case "LINK":
						if (curElem = this.findExact(newElem)) {
							return curElem;
						}
						return <Element> newElem.cloneNode();
					default:
						if (curElem = this.findExact(newElem, target)) {
							return curElem;
						}
				}
			}
			
    		let mergedElem = <Element> newElem.cloneNode(false);
    		for (let childElem of Util.array(newElem.children)) {
    			mergedElem.appendChild(this.mergeElem(childElem, target));
    		}
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
    	
		private findExact(matchingElem: Element, 
				target: Meta.Target = Meta.Target.HEAD|Meta.Target.BODY): Array<Element> {
			
			return this.find(matchingElem, this.attrNames(matchingElem), true, true, target);
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
    		for (let tagElem of Util.find(nodeSelector, matchingElem.tagName)) {
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
    	
    	private compareExact(elem1: Element, elem2: Element, checkInner: boolean) {
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