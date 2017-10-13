namespace Jhtml {
	export class Requestor {
		
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
					
					let response = new Response(url, xhttp.status, xhttp.responseText);
					
					if (xhttp.status == 200) {
						this.upgradeResponse(response);
					};
					
					resolve(response);
				};
				
				xhttp.onerror = () => {
					throw new Error("Could not request " + url.toString());
				};			
			});
		}
		
		private upgradeResponse(response: Response) {
			try {
				response.ajahDirective = new AjahDirective(Model.createFromJsonObj(JSON.parse(response.text)));
			} catch (e) {
				if (e instanceof SyntaxError) {
			        throw new Error(response.url + "; no or invalid json: " + e.message);
			    }
				
				throw e;
			}
		}
	}
}