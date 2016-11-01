<?php
namespace n2n\impl\web\ui\view\html\img;

class ImageSourceSet {
	private $imgSrcs;
	private $attrs;

	public function __construct(array $imgSrcs, array $attrs = null) {
		$this->imgSrcs = $imgSrcs;
		$this->attrs = $attrs;
	}
	
	public function getImgSrcs() {
		return $this->imgSrcs;
	}

	public function getAttrs() {
		return $this->attrs;
	}
}