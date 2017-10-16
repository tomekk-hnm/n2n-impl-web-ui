namespace Jhtml {
	
	export function ready(callback: ReadyCallback, document?: Document) {
		 return getOrCreateContext().onReady(callback);
	}
	
	let browser: Browser = null;
	let monitor: Monitor = null;
	
	export function getOrCreateBrowser(): Browser {
		if (browser) return browser;
		
		let context: Context = getOrCreateContext();
		let containerElem: Element = context.contentManager.containerElem;
		
		if (!containerElem) return null;
		
		monitor = Monitor.from(containerElem);
		browser = new Browser(window, monitor.history);
		
		return browser;
	}
	
	export function getOrCreateMonitor(): Monitor {
		getOrCreateBrowser();
		return monitor;
	}
	
	export function getOrCreateContext(document?: Document): Context {
		return Context.from(document || window.document);
	}
	
	window.document.addEventListener("DOMContentLoaded", () => {
		getOrCreateBrowser();
	}, false);
}