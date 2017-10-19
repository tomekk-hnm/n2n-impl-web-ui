namespace Jhtml.Ui {
	
	export class Scanner {
		static scan(container: Element) {
			for (let elem of Util.find(container, "a.jhtml")) {
				Link.from(<HTMLAnchorElement> elem);
			}
		}
	}
	
}