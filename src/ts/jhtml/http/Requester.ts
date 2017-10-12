namespace Jhtml {
	export class Requester {
		
		constructor() {
			
		}
		
		public exec(url: Url): Promise<Response> {
			let xhttp = new XMLHttpRequest();
			xhttp.open("GET", url.toString(), true);
			xhttp.setRequestHeader("Accept", "application/json");
			xhttp.send();
			
			
			return new Promise((resolve) =>  {
				xhttp.onreadystatechange = () => {
					if (xhttp.readyState != 4) return;
					
					if (xhttp.status == 200) {
						resolve(this.createResponse(url, xhttp.responseText));
					};
					
					throw new Error(url.toString() + "; Status: " + xhttp.status); 
					
				};
				xhttp.onerror = () => {
					console.log(xhttp.readyState + " " + xhttp.status);
					throw new Error("Could not request " + url.toString());
				}				
			});
		}
		
		private createResponse(url: Url, responseText: string): Response {
			try {
				return new OkResponse(Model.createFromJsonObj(JSON.parse(responseText)));
			} catch (e) {
				if (e instanceof SyntaxError) {
			        throw new Error(url + "; no or invalid json: " + e.message);
			    }
				
				throw e;
			}
		}
		
		
	}
	
	
}