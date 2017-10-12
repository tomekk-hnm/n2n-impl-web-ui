namespace Jhtml {
    
    export class Model {
    	public headComplete: boolean = false;
	    public headElements: Array<Element> = [];
	    public bodyStartElements: Array<Element> = [];
	    public bodyEndElements: Array<Element> = [];
    	
    	public comps: { [name: string]: Comp } = {} 
    	
    	public static createFromJsonObj(jsonObj: any, response): Model {
    		let model = new Model();
    		
    		Model.compileContent(model, jsonObj);

    		Model.compileElements(model.headElements, "head", jsonObj);
    		Model.compileElements(model.bodyStartElements, "bodyStart", jsonObj);
    		Model.compileElements(model.bodyEndElements, "bodyEnd", jsonObj);
			
    		return model;
    	}
    	
    	private static compileContent(model: Model, jsonObj: any) {
    		if (typeof jsonObj.content != "string") {
				throw new SyntaxError("Missing or invalid property 'content'.");
			}
    		
    		var template = document.createElement('template');
		    template.innerHTML = jsonObj.content;
		    
		    let compNodeList = template.querySelectorAll(".jhtml-comp");
		    for (let i = 0; i < compNodeList.length; i++) {
		    	let elem: Element = compNodeList.item(i)
		    	let name: string = elem.getAttribute("data-jhtml-name");
		    	
		    	if (model.comps[name || ""]) {
		    		throw new SyntaxError("Duplicated comp name: " + name);
		    	} 
		    	
		    	model.comps[name || ""] = new Comp(name, elem, model);
		    }
		    
		    let headElem = template.querySelector("head");
		    if (!headElem) {
		    	model.headComplete = true;
		    	let elemList = headElem.children;
		    	for (let i in elemList) {
		    		model.headElements.push(elemList[i]);
		    	}
		    }
    	}
    	
    	private static compileElements(elements: Array<Element>, name: string, jsonObj: any) {
    		if (!(jsonObj[name] instanceof Array)) {
				throw new SyntaxError("Missing or invalid property '" + name + "'.");
			}
    		
    		for (let elemHtml of jsonObj.head) {
    			elements.push(Model.createElement(elemHtml));
    		}
    	}
    	
    	private static createElement(elemHtml: string): Element {
    		let templateElem = document.createElement("template");
    		templateElem.innerHTML = elemHtml;
    		return templateElem.firstElementChild;
    	}
    }
    
    export class Comp {
    	constructor(public name: string, public element: Element, public model: Model) {
    	}
    }
}