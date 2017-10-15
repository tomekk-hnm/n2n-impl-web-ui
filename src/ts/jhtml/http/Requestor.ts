namespace Jhtml {
	export class Requestor {
		
		constructor() {
			
		}
		
		public lookupDirective(url: Url): Promise<Directive> {
			return new Promise<Directive>(resolve => {
				this.lookup(url).then((result: Requestor.Result) => {
					resolve(result.directive);
				});
			})
		}
		
		public lookup(url: Url): Promise<Requestor.Result> {
			let xhttp = new XMLHttpRequest();
			xhttp.open("GET", url.toString(), true);
			xhttp.setRequestHeader("Accept", "application/json,text/html");
			xhttp.send();
			
			return new Promise((resolve) =>  {
				xhttp.onreadystatechange = () => {
					if (xhttp.readyState != 4) return;
					
					switch (xhttp.status) {
						case 200:
							let model: Model;
							if (xhttp.responseType.match(/json/)) {
								model = this.createModelFromJson(url, xhttp.responseText);
							} else {
								model = this.createModelFromHtml(xhttp.responseText);
							}

							resolve({ model: model, directive: new ModelDirective(model)});
							break;
						default:
							resolve({ directive: new ReplaceDirective(xhttp.status, xhttp.responseText) });
					}
				};
				
				xhttp.onerror = () => {
					throw new Error("Could not request " + url.toString());
				};			
			});
		}
		
		private createModelFromJson(url: Url, jsonText: string): Model {
			try {
				return Model.createFromJsonObj(JSON.parse(jsonText));
			} catch (e) {
				if (e instanceof SyntaxError) {
			        throw new Error(url + "; no or invalid json: " + e.message);
			    }
				
				throw e;
			}
		}
		
		private createModelFromHtml(html: string): Model {
			return Model.createFromHtml(html);
		}
	}
	
	export namespace Requestor {
		export interface Result {
			model?: Model;
			directive: Directive;
		}
	}
}