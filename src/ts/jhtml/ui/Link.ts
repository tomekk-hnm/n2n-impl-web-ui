namespace Jhtml {
	export class Link {
		constructor(private element: HTMLAnchorElement) {
			element.addEventListener("click", () => {
				this.handle();
				return false;
			});
		}
		
		private handle() {
			Monitor.of(this.element).exec(this.element.href, 
					FullRequestConfig.fromElement(this.element));
		}
		
		private static readonly KEY: string = "jhtml-link";
		
		public static from(element: HTMLAnchorElement): Link {
			let link = Util.getElemData(element, Link.KEY);
			if (link instanceof Link) {
				return link;
			}
			
			link = new Link(element);
			Util.bindElemData(element, Link.KEY, link);
			return link;
		}
	}
}