<?php
namespace n2n\impl\web\ui\view\html\img;

use n2n\reflection\ArgUtils;
use n2n\io\managed\img\ImageFile;

class ImgSet {
	private $defaultImageSrc;
	private $defaultAltAttr;
	private $imageSourceSets;
	
	public function __construct(string $defaultImageSrc, string $defaultAltAttr, array $imageSourceSets) {
		ArgUtils::valArray($imageSourceSets, ImageSourceSet::class);
		$this->defaultImageSrc = $defaultImageSrc;
		$this->defualtAltAttr = $defaultAltAttr;
		$this->imageSourceSets = $imageSourceSets;
	}
	
	public function getDefaultImageSrc() {
		return $this->defaultImageSrc;
	}
	
	public function setDefaultImageSrc(string $defaultImageSrc) {
		$this->defaultImageSrc = $defaultImageSrc;
	}
	
	/**
	 * @return ImageSourceSet[]
	 */
	public function getImageSourceSets() {
		return $this->imageSourceSets;
	}
	
	public function setImageSourceSets(array $imageSourceSets) {
		$this->imageSourceSets = $imageSourceSets;
	}
}