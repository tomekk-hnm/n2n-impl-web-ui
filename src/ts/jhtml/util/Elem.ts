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
}