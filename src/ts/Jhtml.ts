namespace Jhtml {
	
	export function ready(callback: ReadyCallback, document?: Document) {
		 return getOrCreateContext().onReady(callback);
	}
	
	let browser: Browser = null;
	
	export function getOrCreateBrowser(): Browser {
		if (!browser) {
			browser = new Browser(window);
			browser.history = getOrCreateMonitor().requestor.history;
		}
		return browser;
	}
	
	export function getOrCreateContext(): Context {
		return Context.from(document || window.document);
	}
	
	export function getOrCreateMonitor(): Monitor {
		let context = getOrCreateContext();
		if (!context.monitor) {
			context.monitor = new Monitor(new Requestor(new History()));
		}
		return context.monitor;
	}
	
	window.document.addEventListener("DOMContentLoaded", () => {
		if (!window.document.querySelector(".jhtml-container")) return;
		
		getOrCreateBrowser();
	}, false);
}