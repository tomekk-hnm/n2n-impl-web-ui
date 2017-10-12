namespace Jhtml {
	
	export function holeradio() {
		
		let browser = new Browser(window);
		browser.history = new History();
		
		
		let content = new Content(document);
	}
	

	
	export function ready(callback: ReadyCallback) {
		
	}
	
	export interface ReadyCallback {
		(Element): any;
	}
}