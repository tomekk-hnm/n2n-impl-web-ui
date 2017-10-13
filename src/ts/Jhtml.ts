namespace Jhtml {
	
	export function ready(callback: ReadyCallback, document?: Document) {
		 return getOrCreateContext().onReady(callback);
	}
	
	let browser: Browser = null;
	
	export function getOrCreateBrowser(): Browser {
		if (!browser) {
			browser = new Browser(window);
			browser.history = new History(getOrCreateContext(), new Requestor());
		}
		return browser;
	}
	
	export function getOrCreateContext(): Context {
		return Context.from(document || window.document);
	}
	
	window.document.addEventListener("DOMContentLoaded", () => {
		if (!window.document.querySelector(".jhtml-container")) return;
		
		getOrCreateBrowser();
	}, false);
}