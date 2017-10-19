namespace Jhtml {
    
    export class ModelFactory {
    	public static readonly CONTAINER_ATTR: string = "data-jhtml-container";
    	public static readonly COMP_ATTR: string = "data-jhtml-comp";

    	private static readonly CONTAINER_SELECTOR: string =  "[" + ModelFactory.CONTAINER_ATTR + "]";
    	private static readonly COMP_SELECTOR: string =  "[" + ModelFactory.CONTAINER_ATTR + "]";
    	
    	
    	public static createFromJsonObj(jsonObj: any): Model {
    		throw new Error("not yet implemented");
//    		let model = new Model();
//    		
//    		ModelFactory.compileContent(model, jsonObj);
//
//    		ModelFactory.compileElements(model.headElements, "head", jsonObj);
//    		ModelFactory.compileElements(model.bodyStartElements, "bodyStart", jsonObj);
//    		ModelFactory.compileElements(model.bodyEndElements, "bodyEnd", jsonObj);
//			
//    		return model;
    	}
    	    	
    	public static createFromDocument(document: Document): Model {
    		let model = new Model(ModelFactory.createMeta(document.documentElement));
    		
    		ModelFactory.compileContent(model, document.documentElement);
    		return model;
    	}
    	
    	public static createFromHtml(htmlStr: string): Model {
    		let templateElem = document.createElement("template");
		    templateElem.innerHTML = htmlStr;
		    
		    let model = new Model(ModelFactory.createMeta(templateElem));
		    
		    model.container.detach();
		    for (let comp of Object.values(model.comps)) {
		    	comp.detach();
		    }
		    
		    ModelFactory.compileContent(model, templateElem);
    		return model;
    	}
    	
    	public static createMeta(rootElem: Element) {
    	    let headElem = rootElem.querySelector("head");
		    let bodyElem = rootElem.querySelector("body");
		    
		    if (!headElem) {
    			throw new SyntaxError("head element missing.");
		    }
		    
		    if (!bodyElem) {
    			throw new SyntaxError("body element missing.");
		    }
		    
		    let containerList = bodyElem.querySelectorAll(ModelFactory.CONTAINER_SELECTOR);
		    
		    if (containerList.length == 0) {
		    	throw new SyntaxError("Jhtml container missing.");
		    }
		    
		    if (containerList.length > 1) {
		    	throw new SyntaxError("Multiple jhtml container detected.");
		    }
		    
		    return new Meta(rootElem, headElem, bodyElem, containerList[0]);
    	}
    	
    	private static compileContent(model: Model, rootElem: Element) {
    		let containerElem = model.meta.containerElement;
    		let document = containerElem.ownerDocument;
		   
		    model.container = new Container(containerElem.getAttribute(ModelFactory.CONTAINER_ATTR), 
		    		containerElem);
    		
		    let compList = containerElem.querySelectorAll(ModelFactory.COMP_SELECTOR);
		    for (let i in compList) {
		    	let compElem: Element = compList[i];
		    	let name: string = compElem.getAttribute(ModelFactory.COMP_ATTR);
		    	
		    	if (model.comps[name]) {
		    		throw new SyntaxError("Duplicated comp name: " + name);
		    	}
		    	
		    	model.container.compElements[name] = compElem;
		    	model.comps[name] = new Comp(name, compElem);
		    }
    	} 
//    	
//    	private static compileJsonContent(model: Model, jsonObj: any) {
//    		if (typeof jsonObj.content != "string") {
//				throw new SyntaxError("Missing or invalid property 'content'.");
//			}
//    		
//    		ModelFactory.compileContent(model, jsonObj.content);
//    	}
//    	
//    	private static compileElements(elements: Array<Element>, name: string, jsonObj: any) {
//    		if (!(jsonObj[name] instanceof Array)) {
//				throw new SyntaxError("Missing or invalid property '" + name + "'.");
//			}
//    		
//    		for (let elemHtml of jsonObj.head) {
//    			elements.push(ModelFactory.createElement(elemHtml));
//    		}
//    	}
    	
    	private static createElement(elemHtml: string): Element {
    		let templateElem = document.createElement("template");
    		templateElem.innerHTML = elemHtml;
    		return templateElem.firstElementChild;
    	}
    }
}