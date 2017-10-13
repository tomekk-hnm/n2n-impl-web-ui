namespace Jhtml {
	
	export class Monitor {
		public requestor: Requestor;
		
		constructor(private container: Element, public history: History) {
			this.requestor = new Requestor();
		}
		
		exec(urlExpr: Url|string, requestConfig?: RequestConfig): Promise<Response> {
			let url = Url.create(urlExpr);
			let config = FullRequestConfig.from(requestConfig);
			
			let page = this.history.getPageByUrl(url);
			
			if (!config.forceReload && page) {
				if (!page.disposed) {
					page.promise = this.requestor.exec(url);
				}
				
				if (config.pushToHistory && page !== this.history.currentPage) {
					this.history.push(page);
				}
				
				return page.promise;
			}
			
			page = new Page(url, this.requestor.exec(url));
			
			if (config.pushToHistory) {
				this.history.push(page);
			}
			
			return page.promise;
		}
		
		scan() {
			
		}
		
		private static readonly KEY: string = "jhtml-monitor";
		private static readonly CSS_CLASS: string = "jhtml-selfmonitored";
		
		static of(element: Element, selfIncluded: boolean = true): Monitor|null {
			if (selfIncluded && element.matches("." + Monitor.CSS_CLASS)) {
				return Monitor.test(element);
			}
			
			let elem: Element = element.closest("." + Monitor.CSS_CLASS);
			if (elem) {
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
		
		static create(container: Element, history: History): Monitor {
			if (Monitor.test(container)) {
				throw new Error("Monitor for this element already defined.");
			}
			
			container.classList.add(Monitor.CSS_CLASS);
			
			let monitor = new Monitor(container, history);
			Util.bindElemData(container, Monitor.KEY, monitor);
			
			return monitor;
		}
	}
} 