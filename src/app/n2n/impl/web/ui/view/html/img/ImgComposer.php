<?php
namespace n2n\impl\web\ui\view\html\img;

use n2n\core\container\N2nContext;
use n2n\io\managed\File;

interface ImgComposer {
	
	/**
	 * @return ImgSet
	 */
	public function createImgSet(File $file = null, N2nContext $n2nContext): ImgSet;
}