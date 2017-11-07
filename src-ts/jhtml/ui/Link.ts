namespace Jhtml {
	export class Link {
		private requestConfig: RequestConfig;
		private dcr: Util.CallbackRegistry<DirectiveCallback> = new Util.CallbackRegistry();
		
		constructor(private elem: HTMLAnchorElement) {
			this.requestConfig = FullRequestConfig.fromElement(this.elem);
			
			elem.addEventListener("click", (evt) => {
				evt.preventDefault();
				
				this.handle();

				return false;
			});
		}
		
		private handle() {
			Monitor.of(this.elem).exec(this.elem.href, this.requestConfig).then((directive: Directive) => {
				this.dcr.fire();
			});
		}
		
		onDirective(callback: DirectiveCallback) {
			this.dcr.on(callback);
		}
		
		offDirective(callback: DirectiveCallback) {
			this.dcr.off(callback);
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
	
	
	export interface DirectiveCallback {
		(directive: Directive): any;
	}
}