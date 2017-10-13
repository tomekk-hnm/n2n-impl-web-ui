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
        
        public extR(pathExt: string): Url {
            if (pathExt === null || pathExt === undefined) {
                return this;
            }
            
            return new Url(this.urlStr.replace(/\/+$/, "") + "/" + encodeURI(pathExt));
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