namespace Jhtml.Ui {
	export class Scanner {
		public static readonly A_ATTR = "data-jhtml";
		private static readonly A_SELECTOR = "[" + Scanner.A_ATTR + "]";
		
		static scan(rootElem: Element) {
			for (let elem of Util.find(rootElem, Scanner.A_SELECTOR)) {
				Link.from(<HTMLAnchorElement> elem);
			}
		}
	}
}