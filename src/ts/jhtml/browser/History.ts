namespace Jhtml {
    
    export class History {
        private _currentIndex: number
        private _pages: Array<Page> = [];
        private changedCbr = new Util.CallbackRegistry<() => any>();
        private newPageCbr = new Util.CallbackRegistry<PageCallback>();
        
        constructor(public context: Context) {
        }
        
        get currentPage(): Page {
        	if (this._pages[this._currentIndex]) {
        		return this._pages[this._currentIndex];
        	}
        	
        	return null;
        }
        
        getPageByUrl(url: Url): Page {
        	for (let page of this._pages) {
        		if (!page.url.equals(url)) continue;
        		
        		return page;
        	}
        	
        	return null;
        }
        
        onChanged(callback: () => any) {
        	this.changedCbr.on(callback);
        }
        
        offChanged(callback: () => any) {
        	this.changedCbr.off(callback);
        }
        
        onNewPage(callback: PageCallback) {
            this.newPageCbr.on(callback);
        }
        
        offNewPage(callback: PageCallback) {
        	this.newPageCbr.off(callback);
        }
        
        go(index: number, checkUrl?: Url) {
        	if (!this._pages[index]) {
        		throw new Error("Unknown history entry index " + index + ". Check url: " + checkUrl);
        	}
        	
        	if (checkUrl && !this._pages[index].url.equals(checkUrl)) {
        		throw new Error("Check url does not match with page of history entry index " + index + " dow: " 
        				+ checkUrl + " != " + this._pages[index].url);
        	}
        	
        	this._currentIndex = index;
        }
        
        push(url: Url) {
        	
        }
    }
    
    export interface PageCallback {
        (index: number, page: Page)
    }   
}