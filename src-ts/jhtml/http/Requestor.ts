namespace Jhtml {
	export class Requestor {
		
		constructor(private _context: Context) {
		}
		
		get context(): Context {
			return this._context;
		}
		
		public lookupDirective(url: Url): Promise<Directive> {
			return new Promise<Directive>(resolve => {
				this.exec("GET", url).send().then((result: Response) => {
					resolve(result.directive);
				});
			});
		}
		
		public lookupModel(url: Url): Promise<Model> {
			return new Promise<Model>(resolve => {
				this.exec("GET", url).send().then((result: Response) => {
					resolve(result.model);
				});
			});
		}
				
		public exec(method: Requestor.Method, url: Url): Request {
			let xhr = new XMLHttpRequest();
			xhr.open(method, url.toString(), true);
			xhr.setRequestHeader("Accept", "application/json,text/html");
			
			return new Request(this, xhr, url);
		}
	}
	
	export namespace Requestor {
		export type Method = "GET" | "POST" | "PUT" | "DELETE";
	} 
}