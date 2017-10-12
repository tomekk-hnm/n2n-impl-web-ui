namespace Jhtml {
	export class Browser {
		public history: History;
		
        constructor(private window: Window) {
	        window.addEventListener("popstate", (evt) => this.onPopstate(evt));     
		}
        
        private onPopstate(evt) {
//            if (!this.window.history.state) {
//                layer.go(0, this.window.location.href);
//                return;
//            }
//            
//            if (history.state.type != "rocketContext" || history.state.level != 0) {
//                return;
//            }
//            
//            if (!layer.go(history.state.historyIndex, history.state.url)) {
////            history.back();
//            }
        }
        
        private afsd() {
//            var stateObj = { 
//                "type": "rocketContext",
//                "level": layer.level,
//                "url": url,
//                "historyIndex": historyIndex
//            };
//            history.pushState(stateObj, "seite 2", url.toString());
        }
        
	}
	
	class StateObj {
	    
	}
}