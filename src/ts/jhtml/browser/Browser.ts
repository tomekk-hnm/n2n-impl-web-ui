namespace Jhtml {
	export class Browser {
        constructor(private window: Window, private history: History) {
	        this.window.addEventListener("popstate", (evt) => this.onPopstate(evt));
	        
	        history.onPush((entry: History.Entry) => {
	        	this.onPush(entry);
	        });
	        
	        history.onChanged(() => {
	        	this.onChanged();
	        });
		}
        
        private onPopstate(evt) {
        	let url: Url = Url.create(this.window.location.href);
        	let index: number = 0;
        
            if (this.window.history.state && this.window.history.state.historyIndex) {
            	 index = this.window.history.state.historyIndex;
            }
            
            try {
        		this.history.go(index, url);
        	} catch (e) {
        		this.window.location.href = url.toString();
        	}
        }
        
        private onChanged() {
        	let entry: History.Entry = this.history.currentEntry;
        	if (entry.browserHistoryIndex !== undefined) {
        		this.window.history.go(entry.browserHistoryIndex);
        		return;
        	}
        	
        	this.window.location.href = entry.page.url.toString();
        }
        
        private onPush(entry: History.Entry) {
        	entry.browserHistoryIndex = this.window.history.length;
        	
        	let urlStr = entry.page.url.toString();
        	let stateObj = {
        		"url": urlStr,
				"historyIndex": entry.index
        	};
            this.window.history.pushState(stateObj, "Page", urlStr);
        }
	}
}