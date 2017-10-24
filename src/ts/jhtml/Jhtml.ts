namespace Jhtml {
	export function ready(callback: ReadyCallback, document?: Document) {
		 return getOrCreateContext().onReady(callback);
	}
	
	let browser: Browser = null;
	let monitor: Monitor = null;
	
	export function getOrCreateBrowser(): Browser {
		if (browser) return browser;
		
		let context: Context = getOrCreateContext();
	
		if (!context.isJhtml()) return null;
		
		monitor = Monitor.from(context.document.documentElement);
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
	
	export function lookupModel(url: Url|string): Promise<Model> {
		getOrCreateBrowser();
		return monitor.lookupModel(Url.create(url))
	}
	
	window.document.addEventListener("DOMContentLoaded", () => {
		getOrCreateBrowser();
	}, false);
}