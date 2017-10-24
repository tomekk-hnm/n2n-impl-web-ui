namespace Jhtml {
    export class Url {
        protected urlStr: string;
        
        constructor(urlStr: string) {
            this.urlStr = urlStr;
        }
        
        public toString(): string {
            return this.urlStr;
        }
        
        public equals(url: Url): boolean {
            return this.urlStr == url.urlStr;
        }
        
        public extR(pathExt?: string, queryExt?: { [key: string]: string }): Url {
        	let newUrlStr = this.urlStr;
        	
            if (pathExt !== null || pathExt !== undefined) {
            	newUrlStr.replace(/\/+$/, "") + "/" + encodeURI(pathExt);
            }
            
            if (queryExt !== null || queryExt !== undefined) {
            	let queryExtStr = Object.keys(queryExt)
            			.map(k => encodeURIComponent(k) + '=' + encodeURIComponent(queryExt[k]))
            			.join('&');
            	if (newUrlStr.match(/?/)) {
            		newUrlStr += "&" + queryExtStr;
            	} else {
            		newUrlStr += "?" + queryExtStr;
            	}
            }
            
            return new Url(newUrlStr);
        }
        
        public static build(urlExpression: string|Url): Url|null {
        	if (urlExpression === null || urlExpression === undefined) return null;
        	
        	return Url.create(urlExpression);
        }
        
        public static create(urlExpression: string|Url): Url {
            if (urlExpression instanceof Url) {
                return urlExpression;
            }
            
            return new Url(Url.absoluteStr(urlExpression));
        }
        
        public static absoluteStr(urlExpression: string|Url): string {
            if (urlExpression instanceof Url) {
                return urlExpression.toString();
            }
            
            var urlStr = <string> urlExpression;
            
            if (!/^(?:\/|[a-z]+:\/\/)/.test(urlStr)) {
                return window.location.toString().replace(/\/+$/, "") + "/" + urlStr;
            } 
            
            if (!/^(?:[a-z]+:)?\/\//.test(urlStr)) {
                return window.location.protocol + "//" + window.location.host + urlStr;             
            }
            
            return urlStr;
        }
    }
}