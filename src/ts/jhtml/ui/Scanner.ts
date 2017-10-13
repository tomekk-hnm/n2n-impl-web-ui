namespace Jhtml.Ui {
	
	export class Scanner {
		static scan(container: Element) {
			let aList = container.querySelectorAll("a.jhtml");
			for (let i in aList) {
				Link.from(<HTMLAnchorElement> aList[i]);
			}
		}
	}
	
}