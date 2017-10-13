namespace Jhtml.Util {
	
	export class CallbackRegistry<C> {
		private callbacks: { [type: string]: Array<C> } = {};
		
		on(callback: C) {
			this.onType("", callback);
		}
		
		onType(type: string = "", callback: C) {
			if (!this.callbacks[type]) {
				this.callbacks[type] = [];
			}
			
			if (-1 == this.callbacks[type].indexOf(callback)) {
				this.callbacks[type].push(callback);
			}
		}
		
		off(callback: C) {
			this.offType("", callback);
		}
		
		offType(type: string = "", callback: C) {
			if (!this.callbacks[type]) 	return;
			
			let i = this.callbacks[type].indexOf(callback);
			this.callbacks[type].splice(i, 1);
		}
		
		trigger(...args: Array<any>) {
			this.triggerType("", args);
		}
		
		triggerType(type: string, ...args: Array<any>) {
			if (!this.callbacks[type]) 	return;
			
			for (let callback of this.callbacks[type]) {
				(<any> callback)(...args);
			}
		}
	}
}