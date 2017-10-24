<?php
/*
 * Copyright (c) 2012-2016, Hofmänner New Media.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This file is part of the N2N FRAMEWORK.
 *
 * The N2N FRAMEWORK is free software: you can redistribute it and/or modify it under the terms of
 * the GNU Lesser General Public License as published by the Free Software Foundation, either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * N2N is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details: http://www.gnu.org/licenses/
 *
 * The following people participated in this project:
 *
 * Andreas von Burg.....: Architect, Lead Developer
 * Bert Hofmänner.......: Idea, Frontend UI, Community Leader, Marketing
 * Thomas Günther.......: Developer, Hangar
 */
namespace n2n\impl\web\ui\view\jhtml;

use n2n\web\http\BufferedResponseObject;
use n2n\web\http\Response;
use n2n\impl\web\ui\view\html\HtmlView;

class JhtmlResponse extends BufferedResponseObject {
	const HEAD_KEY = 'head';
	const BODY_START_KEY = 'bodyStart';
	const BODY_END_KEY = 'bodyEnd';
	const ADDITIONAL_KEY = 'additional';
	const CONTENT_KEY = 'content';
	
	private $htmlView;
	private $additionalAttrs;
	
	private $ajahResponse = null;
	
	public function __construct(HtmlView $htmlView, array $additionalAttrs = array())  {
		$this->htmlView = $htmlView;
		$this->setAdditionalAttrs($additionalAttrs);
	}
		
	public function setAdditionalAttrs(array $additionalAttrs) {
		$this->additionalAttrs = $additionalAttrs;
	}
	
	/* (non-PHPdoc)
	 * @see \n2n\web\http\BufferedResponseObject::getBufferedContents()
	 */
	public function getBufferedContents(): string {
	    if ($this->ajahResponse === null) {
	        return $this->htmlView->getBufferedContents();
	    }
	    
	    return $this->ajahResponse->getBufferedContents();
	}
	/* (non-PHPdoc)
	 * @see \n2n\web\http\ResponseObject::prepareForResponse()
	 */
	public function prepareForResponse(Response $response) {
	    if ('application/json' == $response->getRequest()->getAcceptRange()
	               ->bestMatch(['text/html', 'application/json'])) {
	        $this->ajahResponse = new AjahResponse($this->htmlView);
	        $this->ajahResponse->prepareForResponse($response);
	        return;
	    }
	    
	    $this->ajahResponse = null;
	    $this->htmlView->prepareForResponse($response);
	}
	/* (non-PHPdoc)
	 * @see \n2n\web\http\ResponseObject::toKownResponseString()
	 */
	public function toKownResponseString(): string {
		return 'Jhtml Response';
	}
	
// 	public static function creataFromHtmlView(HtmlView $view, array $additionalData = null) {
// 		if (null !== $additionalData) {
// 			$data = $additionalData;
// 		}
// 		return new AjahResponse(array_merge(self::extractJsonableArray($view), $additionalData));
// 	}
}
