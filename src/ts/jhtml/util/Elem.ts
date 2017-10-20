namespace Jhtml.Util {
	
	
	export function closest(element: Element, selector: string, selfIncluded: boolean): Element {
		do {
			if (element.matches(selector)) {
				return element;
			}
		} while(element = element.parentElement);
	}
	
	
	export function getElemData(elem: Element, key: string) {
		return elem["data-" + key];
	}
	
	export function bindElemData<T>(elem: Element, key: string, data: any) {
		elem["data-" + key] = data;
	}

	export function find(nodeSelector: NodeSelector, selector: string): Array<Element> {
		let foundElems: Array<Element> = [];
		let nodeList = nodeSelector.querySelectorAll(selector);
		for (let i = 0; i < nodeList.length; i++) {
			foundElems[i] = nodeList.item(i);
		}
		return foundElems;
	}
	
	export function array(nodeList: NodeList): Array<Element> {
		let elems: Array<Element> = [];
		for (let i = 0; i < nodeList.length; i++) {
			elems.push(<Element> nodeList.item(i));
		}
		return elems;
	}
}