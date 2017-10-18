namespace Jhtml {
    
    export class ModelFactory {
    	public static readonly CONTAINER_ATTR: string = "data-jhtml-container";
    	public static readonly COMP_ATTR: string = "data-jhtml-comp";
    	
    	public static createFromJsonObj(jsonObj: any): Model {
    		let model = new Model();
    		
    		ModelFactory.compileContent(model, jsonObj);

    		ModelFactory.compileElements(model.headElements, "head", jsonObj);
    		ModelFactory.compileElements(model.bodyStartElements, "bodyStart", jsonObj);
    		ModelFactory.compileElements(model.bodyEndElements, "bodyEnd", jsonObj);
			
    		return model;
    	}
    	    	
    	public static createFromDocument(document: Document): Model {
    		return ModelFactory.createFromHtml(document.documentElement.innerHTML);
    	}
    	
    	public static createFromHtml(htmlStr: string): Model {
    		let model = new Model();
    		ModelFactory.compileContent(model, htmlStr);
    		return model;
    	}
    	
    	private static compileContent(model: Model, htmlStr: string) {
    		var templateElem = document.createElement('template');
		    templateElem.innerHTML = htmlStr;
		    
		    let headElem = templateElem.querySelector("head");
		    let bodyElem = templateElem.querySelector("body");
		    
    		if (!bodyElem) {
    			throw new SyntaxError("body element missing.");
		    }
		    		    
    		if (headElem) {
			    let elemList = headElem.children;
		    	for (let i in elemList) {
		    		model.headElements.push(elemList[i]);
		    	}
    		}
		    
    		let containerSelector = "[" + ModelFactory.CONTAINER_ATTR + "]";
		    for (let i in bodyElem.children) {
		    	let elem = bodyElem.children[i];
		    	
		    	let containerRootElem = null;
		    	let containerElem = null;
		    	
		    	if (elem.matches(containerSelector)) {
		    		containerRootElem = containerElem = elem;
		    	} else if (containerElem = elem.querySelector(containerSelector)){
		    		containerRootElem = elem;
		    	}
		    	
		    	if (containerElem) {
		    		if (model.container) {
		    			throw new SyntaxError("Multiple jhtml container detected.");
		    		}	
		    		
		    		model.containerRootElem = containerRootElem;
		    		model.container = new Container(containerElem.getAttribute(ModelFactory.COMP_ATTR), containerElem);
		    		continue;
		    	}
		    	
		    	if (model.container) {
		    		model.bodyStartElements.push(elem);
		    	} else {
		    		model.bodyEndElements.push(elem);
		    	}
		    }
		    		    
		    let compNodeList = templateElem.querySelectorAll("[" + ModelFactory.CONTAINER_ATTR + "] [" + ModelFactory.COMP_ATTR + "]");
		    for (let i = 0; i < compNodeList.length; i++) {
		    	let elem: Element = compNodeList.item(i)
		    	let name: string = elem.getAttribute(ModelFactory.COMP_ATTR);
		    	
		    	if (model.comps[name]) {
		    		throw new SyntaxError("Duplicated comp name: " + name);
		    	}
		    	
		    	model.comps[name] = new Comp(name, elem, model);
		    }
		    
		    if (!model.container) {
		    	throw new SyntaxError("No jhtml container found.");
		    }
    	} 
    	
    	private static compileJsonContent(model: Model, jsonObj: any) {
    		if (typeof jsonObj.content != "string") {
				throw new SyntaxError("Missing or invalid property 'content'.");
			}
    		
    		ModelFactory.compileContent(model, jsonObj.content);
    	}
    	
    	private static compileElements(elements: Array<Element>, name: string, jsonObj: any) {
    		if (!(jsonObj[name] instanceof Array)) {
				throw new SyntaxError("Missing or invalid property '" + name + "'.");
			}
    		
    		for (let elemHtml of jsonObj.head) {
    			elements.push(ModelFactory.createElement(elemHtml));
    		}
    	}
    	
    	private static createElement(elemHtml: string): Element {
    		let templateElem = document.createElement("template");
    		templateElem.innerHTML = elemHtml;
    		return templateElem.firstElementChild;
    	}
    }
}