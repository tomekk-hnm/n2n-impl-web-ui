namespace Jhtml {
    
    export class History {
        private _currentIndex: number
        private _entries: Array<Response>;
        private onNewEntryCallbacks: Array<() => any> = [];
        
        constructor() {
            
        }
        
        
        
        onNewEntry(callback: EntryCallback) {
            this.onNewEntry(callback);
        }
        
        offNewEntry(callback: EntryCallback) {
            for (let i in this.onNewEntryCallbacks) {
                if (this.onNewEntryCallbacks[i] === callback) {
                    this.onNewEntryCallbacks.splice(parseInt(i), 1);
                    break;
                }
            }
        }
    }
    
    export interface EntryCallback {
        (index: number, context: Response)
    }
}