<?php
namespace n2n\io\managed\img\impl;

interface ImgComposer {
	
	/**
	 * @return ImgSet[]
	 */
	public function createImgSet(): array;
}