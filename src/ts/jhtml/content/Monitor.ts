namespace Jhtml {
	
	export class Monitor {
		public context: Context;
		public history: History;
		
		constructor(private container: Element) {
			this.context = Context.from(container.ownerDocument);
			this.history = new History();
		}
		
		exec(urlExpr: Url|string, requestConfig?: RequestConfig): Promise<Directive> {
			let url = Url.create(urlExpr);
			let config = FullRequestConfig.from(requestConfig);
			
			let page = this.history.getPageByUrl(url);

			if (!config.forceReload && page) {
				if (!page.disposed) {
					page.promise = this.context.requestor.lookupDirective(url);
				}
				
				if (config.pushToHistory && page !== this.history.currentPage) {
					this.history.push(page);
				}
				
				this.dingsel(page.promise);
				return page.promise;
			}
			
			page = new Page(url, this.context.requestor.lookupDirective(url));
			
			if (config.pushToHistory) {
				this.history.push(page);
			}
			
			this.dingsel(page.promise);
			return page.promise;
		}
		
		private dingsel(promise: Promise<Directive>) {
			promise.then((directive: Directive) => {
				directive.exec(this.context, this.history);
			});
		}
		
		private static readonly KEY: string = "jhtml-monitor";
		private static readonly CSS_CLASS: string = "jhtml-selfmonitored";
		
		static of(element: Element, selfIncluded: boolean = true): Monitor|null {
			if (selfIncluded && element.matches("." + Monitor.CSS_CLASS)) {
				return Monitor.test(element);
			}

			if (element = element.closest("." + Monitor.CSS_CLASS)) {
				return Monitor.test(element);
			}
			
			return null;
		}
		
		static test(element: Element): Monitor|null {
			let monitor = Util.getElemData(element, Monitor.KEY);
			if (element.classList.contains(Monitor.CSS_CLASS) && monitor instanceof Monitor) {
				return monitor;
			}
			return null;
		}
		
		static from(container: Element): Monitor {
			let monitor = Monitor.test(container);
			
			if (monitor) return monitor;
			
			container.classList.add(Monitor.CSS_CLASS);
			
			monitor = new Monitor(container);
			Util.bindElemData(container, Monitor.KEY, monitor);
			
			return monitor;
		}
	}
} 