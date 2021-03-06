namespace Jhtml {
    
    export class History {
        private _currentIndex: number
        private _entries: Array<History.Entry> = [];
        private changedCbr = new Util.CallbackRegistry<() => any>();
        private pushCbr = new Util.CallbackRegistry<EntryCallback>();
        
        get currentEntry(): History.Entry {
        	if (this._entries[this._currentIndex]) {
        		return this._entries[this._currentIndex];
        	}
        	
        	return null;
        }
        
        get currentPage(): Page {
        	let entry;
        	if (entry = this.currentEntry) {
        		return entry.page;
        	}
        	
        	return null;
        }
        
        getPageByUrl(url: Url): Page {
        	for (let entry of this._entries) {
        		if (!entry.page.url.equals(url)) continue;
        		
        		return entry.page;
        	}
        	
        	return null;
        }
        
        onChanged(callback: () => any) {
        	this.changedCbr.on(callback);
        }
        
        offChanged(callback: () => any) {
        	this.changedCbr.off(callback);
        }
        
        onPush(callback: EntryCallback) {
            this.pushCbr.on(callback);
        }
        
        offPush(callback: EntryCallback) {
        	this.pushCbr.off(callback);
        }
        
        go(index: number, checkUrl?: Url) {
        	if (!this._entries[index]) {
        		throw new Error("Unknown history entry index " + index + ". Check url: " + checkUrl);
        	}
        	
        	if (checkUrl && !this._entries[index].page.url.equals(checkUrl)) {
        		throw new Error("Check url does not match with page of history entry index " + index + " dow: " 
        				+ checkUrl + " != " + this._entries[index].page.url);
        	}
        	
        	if (this._currentIndex == index) return;
        	
        	this._currentIndex = index;
        	this.changedCbr.fire();
        }
        
        push(page: Page) {
        	let sPage = this.getPageByUrl(page.url);
        	if (sPage && sPage !== page) {
        		throw new Error("Page with same url already registered.");
        	}
        	
        	let nextI = this._currentIndex + 1;
        	for (let i = nextI; i < this._entries.length; i++) {
        		this._entries[i].page.dispose();
        	}
        	this._entries.splice(nextI);
        	
        	this._currentIndex = this._entries.length;
        	let entry = new History.Entry(this._currentIndex, page);
        	this._entries.push(entry);

        	this.pushCbr.fire(entry);
        	this.changedCbr.fire();
        }
    }
    
    export interface EntryCallback {
        (entry: History.Entry)
    }   
    
    export namespace History {
	    export class Entry {
	    	public browserHistoryIndex: number;
	    	
	    	constructor(private _index: number, private _page: Page) {
	    	}
	    	
	    	get index(): number {
	    		return this._index;
	    	}
	    	
	    	get page(): Page{
	    		return this._page;
	    	}
	    }
    }
}