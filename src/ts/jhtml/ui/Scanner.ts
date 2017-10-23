namespace Jhtml.Ui {
	export class Scanner {
		public static readonly A_ATTR = "data-jhtml";
		private static readonly A_SELECTOR = "a[" + Scanner.A_ATTR + "]";
		
		public static readonly FORM_ATTR = "data-jhtml";
		private static readonly FORM_SELECTOR = "form[" + Scanner.FORM_ATTR + "]";
		
		static scan(rootElem: Element) {
			for (let elem of Util.find(rootElem, Scanner.A_SELECTOR)) {
				Link.from(<HTMLAnchorElement> elem);
			}
			
			for (let elem of Util.find(rootElem, Scanner.FORM_SELECTOR)) {
				Form.from(<HTMLFormElement> elem);
			}
		}
	}
}