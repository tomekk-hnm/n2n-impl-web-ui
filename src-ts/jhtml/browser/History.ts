namespace Jhtml {
    
    export class History {
        private _currentIndex: number
        private _entries: Array<History.Entry> = [];
        private changeCbr = new Util.CallbackRegistry<(evt: ChangeEvent) => any>();
        private changedCbr = new Util.CallbackRegistry<(evt: ChangeEvent) => any>();
        private pushCbr = new Util.CallbackRegistry<EntryCallback>();
        
        get currentIndex(): number {
        	return this._currentIndex;
        }
        
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
        
        getEntryByIndex(index: number): History.Entry {
        	if (this._entries[index]) {
        		return this._entries[index];
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
        
        onChange(callback: (evt: ChangeEvent) => any) {
        	this.changeCbr.on(callback);
        }
        
        offChange(callback: (evt: ChangeEvent) => any) {
        	this.changeCbr.off(callback);
        }
        
        onChanged(callback: (evt: ChangeEvent) => any) {
        	this.changedCbr.on(callback);
        }
        
        offChanged(callback: (evt: ChangeEvent) => any) {
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

        	let evt: ChangeEvent = { pushed: false, indexDelta: (index - this._currentIndex) };
        	this.changeCbr.fire(evt);
        	this._currentIndex = index;
        	this.changedCbr.fire(evt);
        }
        
        push(page: Page) {
        	let sPage = this.getPageByUrl(page.url);
        	if (sPage && sPage !== page) {
        		throw new Error("Page with same url already registered.");
        	}
        	
        	let evt: ChangeEvent = { pushed: true, indexDelta: 1 };
        	this.changeCbr.fire(evt);
        	
        	let nextI = (this._currentIndex || -1) + 1;
        	for (let i = 0; i < this._entries.length; i++) {
        		let iPage = this._entries[i].page;
        		if (!iPage.config.frozen || i >= nextI) {
        			iPage.dispose();
        		}
        	}
        	this._entries.splice(nextI);
        	
        	this._currentIndex = nextI;
        	let entry = new History.Entry(this._currentIndex, page);
        	this._entries.push(entry);
        	
        	this.pushCbr.fire(entry);
        	this.changedCbr.fire(evt);
        }
    }
    
    export interface EntryCallback {
        (entry: History.Entry)
    }   


    export interface ChangeEvent {
        pushed: boolean;
    	indexDelta: number;
    }
    
    export namespace History {
        
	    export class Entry {
	    	scrollPos: number = 0;
	    	
	    	constructor(private _index: number, private _page: Page) {
	    	}
	    	
	    	get index(): number {
	    		return this._index;
	    	}
	    	
	    	get page(): Page {
	    		return this._page;
	    	}
	    }
    }
}