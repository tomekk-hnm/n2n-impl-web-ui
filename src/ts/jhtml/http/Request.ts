namespace Jhtml {
	
	export class Request  {
		constructor (private requestor: Requestor, private _xhr: XMLHttpRequest, private _url: Url) {
		}
		
		get xhr(): XMLHttpRequest {
			return this._xhr;
		}
		
		get url(): Url {
			return this._url;
		}
		
		abort() {
			this.xhr.abort();
		}
		
		send(data?: FormData): Promise<Response> {
			this.xhr.send(data);
			
			return this.buildPromise();
		}
		
		
		private buildPromise(): Promise<Response> {
			return new Promise((resolve) =>  {
				this.xhr.onreadystatechange = () => {
					if (this.xhr.readyState != 4) return;
					
					switch (this.xhr.status) {
						case 200:
							let model: Model;
							if (this.xhr.responseType.match(/json/)) {
								model = this.createModelFromJson(this.url, this.xhr.responseText);
							} else {
								model = this.createModelFromHtml(this.xhr.responseText);
							}

							resolve({ model: model, directive: new ModelDirective(model)});
							break;
						default:
							resolve({ directive: new ReplaceDirective(this.xhr.status, this.xhr.responseText, 
									this.xhr.getResponseHeader("Content-Type"), this.url) });
					}
				};
				
				this.xhr.onerror = () => {
					throw new Error("Could not request " + this.url.toString());
				};
			});
		}
		
		private createModelFromJson(url: Url, jsonText: string): Model {
			try {
				let model = ModelFactory.createFromJsonObj(JSON.parse(jsonText));
				this.requestor.context.registerNewModel(model);
				return model;
			} catch (e) {
				if (e instanceof ParseError) {
			        throw new Error(url + "; no or invalid json: " + e.message);
			    }
				
				throw e;
			}
		}
		
		private createModelFromHtml(html: string): Model {
			let model = ModelFactory.createFromHtml(html);
			this.requestor.context.registerNewModel(model);
			return model;
		}
	}
}