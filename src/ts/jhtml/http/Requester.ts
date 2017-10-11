namespace Jhtml {
	export class Requester {
		
		constructor() {
			
		}
		
		public exec(url: Url): Promise<Response> {
			let xhttp = new XMLHttpRequest();
			xhttp.open("GET", url.toString(), true);
			xhttp.setRequestHeader("Accept", "application/json");
			xhttp.send();
			xhttp.onreadystatechange = () => {
				if (xhttp.readyState == 4 && xhttp.status == 200) {
					alert(xhttp.responseText);
				    var myArr = JSON.parse(xhttp.responseText);
				    alert(myArr);
				};
			}
			
			return new Promise((resolve) =>  {
				resolve(new Response(url));
			})
		}
	}
	
	
}