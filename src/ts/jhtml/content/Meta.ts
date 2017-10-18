namespace Jhtml {
    export class Meta {
    	public headElem: Element;
    	public bodyElem: Element;
		public containerElem: Element;
    
    	public headElements: Array<Element> = [];
	    public bodyStartElements: Array<Element> = [];
	    public bodyEndElements: Array<Element> = [];
    
    	constructor(public rootElem: Element) {
    	}
    
//    	private cloneElements(from: Array<Element>, to: Array<Element>) {
//    		for (let element of from) {
//    			to.push(<Element> element.cloneNode());
//    		}
//    	}
    	
		private import(newMeta: Meta) {
			let mergedElems: Array<Element> = [];
		
			for (let newElem of newMeta.headElements) {
				this.mergeElem(newElem, Meta.Target.HEAD);
			}
		}
			
		private mergeElem(newElem: Element, target: Meta.Target) {
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
    		
    		let mergedElem = newElem.cloneNode(false);
    
    		for (let i in newElem.children) {
    			mergedElem.appendChild(this.mergeElem(newElem.children[i], target));
    		}
		}
    	
		findExact(matchingElem: Element, 
				target: Meta.Target = Meta.Target.HEAD|Meta.Target.BODY): Array<Element> {
			let attrNames: Array<string> = [];
			let attrs = matchingElem.attributes;
			for (let i in attrs) {
				attrNames.push(attrs[i].name);
			}
			
			return this.find(matchingElem, attrNames, true, true, target);
		}
		
		public find(matchingElem: Element, matchingAttrNames: Array<string>, checkInner: boolean, 
				checkAttrNum: boolean, target: Meta.Target = Meta.Target.HEAD|Meta.Target.BODY): Array<Element> {
			let foundElems: Array<Element> = [];
			
			if (target & Meta.Target.HEAD) {
				for (let elem of this.filter(this.headElements, matchingElem, matchingAttrNames, checkInner, checkAttrNum)) {
					foundElems.push(elem);
				}
			}
			
			if (target & Meta.Target.BODY) {
				for (let elem of this.filter(this.bodyStartElements, matchingElem, matchingAttrNames, checkInner, checkAttrNum)) {
					foundElems.push(elem);
				}
				
				for (let elem of this.filter(this.bodyEndElements, matchingElem, matchingAttrNames, checkInner, checkAttrNum)) {
					foundElems.push(elem);
				}
			}
			
			return foundElems;
		}
    	
    	private filter(elements: Array<Element>, matchingElem: Element, matchingAttrNames: Array<string>,
    				checkInner: boolean, chekAttrNum: boolean): Array<Element> {
    		
    		let tagElems: Array<Element> = [];
    		for (let element of elements) {
	    		if (element.tagName == matchingElem.tagName) {
	    			tagElems.push(element);
	    			
	    			let list = element.querySelectorAll(matchingElem.tagName);
					for (let i in list) {
						tagElems.push(list.item(parseInt(i)));
					}
	    		}
    		}
    			
    		let filteredElems: Array<Element> = [];
	    	for (let tagElem of tagElems) {
				if (this.compare(tagElem, matchingElem, matchingAttrNames, checkInner, chekAttrNum)) {
					filteredElems.push(tagElem);
				}
			}
			return filteredElems;
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