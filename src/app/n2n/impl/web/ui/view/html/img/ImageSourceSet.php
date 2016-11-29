<?php
namespace n2n\impl\web\ui\view\html\img;

class ImageSourceSet {
	private $imgSrcs;
	private $mediaAttr;
	private $attrs;

	public function __construct(array $imgSrcs, string $mediaAttr = null, array $attrs = null) {
		$this->imgSrcs = $imgSrcs;
		$this->mediaAttr = $mediaAttr;
		$this->attrs = (array) $attrs;
	}
	
	public function getMediaAttr() {
		return $this->mediaAttr;
	}
	
	public function setMediaAttr(string $mediaAttr) {
		$this->mediaAttr = $mediaAttr;
	}
	
	public function getImgSrcs() {
		return $this->imgSrcs;
	}
	
	public function getSrcsetAttr() {
		$attrs = array();
		foreach ($this->imgSrcs as $htmlLength => $imgSrc) {
			$attrs[] = $imgSrc . ' ' . $htmlLength;
		}
		return implode(', ', $attrs);
	}

	public function getAttrs() {
		return $this->attrs;
	}
}