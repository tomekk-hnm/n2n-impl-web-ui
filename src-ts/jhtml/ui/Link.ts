namespace Jhtml {
	export class Link {
		private requestConfig: RequestConfig;
		
		constructor(private elem: HTMLAnchorElement) {
			this.requestConfig = FullRequestConfig.fromElement(this.elem);
			
			elem.addEventListener("click", (evt) => {
				evt.preventDefault();
				
				this.handle();

				return false;
			});
		}
		
		private handle() {
			Monitor.of(this.elem).exec(this.elem.href, this.requestConfig);
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