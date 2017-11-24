namespace Jhtml {
	export class Browser {
        constructor(private window: Window, private _history: History) {
	        _history.push(new Page(Url.create(window.location.href), null));
	        
	        _history.onPush((entry: History.Entry) => {
	        	this.onPush(entry);
	        });
	        
	        _history.onChanged((evt) => {
	        	this.onChanged(evt);
	        });

//	        this.window.addEventListener("popstate", (evt) => {
//        	    this.onPopstate(evt)
//        	});
	        
	        this.window.onpopstate = (evt) => {
                this.onPopstate(evt)
            };
		}
        
        get history(): History {
        	return this._history;
        }
        
        private poping: boolean = false;
        
        private onPopstate(evt) {
        	let url: Url = Url.create(this.window.location.toString());
        	let index: number = 0;
        
        	if (evt.state && evt.state.jhtmlHistoryIndex) {
            	 index = evt.state.jhtmlHistoryIndex;
            }
            
            try {
                this.poping = true;
        		this.history.go(index, url);
        		this.poping = false;
        	} catch (e) {
        	    alert("err " + e.message);
        	    this.window.location.href = url.toString();
        	}
        }
        
        private onChanged(evt: ChangeEvent) {
            if (this.poping || evt.pushed) return;
           
        	let entry: History.Entry = this.history.currentEntry;
            
            if (entry.browserHistoryIndex !== undefined) {
                alert("noo");
        		this.window.history.go(entry.browserHistoryIndex);
        		return;
        	}
        	
        	this.window.location.href = entry.page.url.toString();
        }
        
        private onPush(entry: History.Entry) {
        	let urlStr = entry.page.url.toString();
        	let stateObj = {
        		"jhtmlUrl": urlStr,
				"jhtmlHistoryIndex": entry.index
        	};
            this.window.history.pushState(stateObj, "Page", urlStr);
        }
	}
}