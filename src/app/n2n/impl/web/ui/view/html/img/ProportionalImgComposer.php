<?php
namespace n2n\impl\web\ui\view\html\img;

use n2n\io\managed\File;
use n2n\core\container\N2nContext;
use n2n\io\managed\img\ImageFile;
use n2n\io\managed\img\impl\ProportionalThumbStrategy;

class ProportionalImgComposer implements ImgComposer {
	private $width;
	private $height;
	private $autoCropMode;
	private $scaleUpAllowed;

	private $fixedWidths;
	private $maxWidth;
	private $minWidth;

	/**
	 * @param int $width
	 * @param int $height
	 * @param string $autoCropMode
	 * @param bool $scaleUpAllowed
	 */
	public function __construct(int $width, int $height, string $autoCropMode = null, bool $scaleUpAllowed = true) {
		$this->maxWidth = $this->minWidth = $this->width = $width;
		$this->height = $height;
		$this->autoCropMode = $autoCropMode;
		$this->scaleUpAllowed = $scaleUpAllowed;
	}

	/**
	 * @param int $width
	 * @return ProportiaonalThumbStrategyComposer
	 */
	public function toWidth(int $width) {
		if ($width > $this->maxWidth) {
			$this->maxWidth = $width;
			return $this;
		}

		if ($width < $this->minWidth) {
			$this->minWidth = $width;
			return $this;
		}

		return $this;
	}

	public function widths(int ...$widths) {
		foreach ($widths as $width) {
			$this->fixedWidths[$width] = $width;
		}
		return $this;
	}

	public function factors(float ...$factors) {
		foreach ($factors as $factor) {
			$width = (int) ceil($this->width * $factor);
			$this->fixedWidths[$width] = $width;
		}
		return $this;
	}

	private function getWidths() {
		$widths = $this->fixedWidths;
		$widths[$this->minWidth] = $this->minWidth;
		$widths[$this->width] = $this->width;
		$widths[$this->maxWidth] = $this->maxWidth;
		krsort($widths, SORT_NUMERIC);
		return $widths;
	}
	
	private function createPlaceholderImgSet() {
		$widths = $this->getWidths();
		$largestWidth = reset($widths);
		$largestHeight = $this->calcHeight($largestWidth);
		
		return new ImgSet(UiComponentFactory::createInvalidImgSrc($largestWidth, $largestHeight), 
				UiComponentFactory::INVALID_IMG_DEFAULT_ALT, $largestWidth, $largestHeight, array());
	}
	
	public function createImgSet(File $file = null, N2nContext $n2nContext): ImgSet {
		if ($file === null || !$file->isValid()) {
			return $this->createPlaceholderImgSet();
		}
		
		$imageFile = new ImageFile($file);

		$thumbFile = null;
		$imageFiles = array();
		foreach ($this->getWidths() as $width) {
			if ($thumbFile === null) {
				$imageFiles[$width] = $thumbFile = $this->createThumb($imageFile, $width);
				continue;
			}
				
			$imageFiles[$width] = $this->createVariation($thumbFile, $width);
		}

		$lastSize = null;
		$lastWidth = null;
		foreach ($imageFiles as $width => $imageFile) {
			if ($width > $this->maxWidth || $width < $this->minWidth) continue;
				
			// 			$size = $imageFile->getFile()->getFileSource()->getSize();
			// 			if (!$this->isSizeGabTooLarge($lastWidth, $lastWidth = $size)) continue;
				
			// 			if ($lastSize > $size) {

			// 			}
		}

		$imgSrcs = array();
		foreach ($imageFiles as $width => $imageFile) {
			$imgSrcs[$width . 'w'] = UiComponentFactory::createImgSrc($imageFile);
		}

		$defaultImageFile = reset($imageFiles);
		return new ImgSet(reset($imgSrcs), $file->getOriginalName(),
				$defaultImageFile->getWidth(), $defaultImageFile->getHeight(), 
				array(new ImageSourceSet(array_reverse($imgSrcs, true))));
	}

	const MIN_SIZE_GAB = 51200;

	private function isSizeGabTooLarge($largerSize, $size) {
		$diff = $largerSize - $size;
		if ($diff <= self::MIN_SIZE_GAB) return false;

		return ($largerSize / 3 < $diff);
	}

	private function calcGabWidth($largerWidth, $width) {
		$diff = $largerWidth - $width;

		if ($diff > $largerWidth * 0.75) {
			return $largerWidth - (int) ceil($diff / 2);
		}

		return null;
	}
	
	private function calcHeight($width) {
		return ceil($this->height / $this->width * $width);
	}

	private function createStrategy($width) {
		$height = $this->calcHeight($width);

		return new ProportionalThumbStrategy($width, $height, $this->autoCropMode, $this->scaleUpAllowed);
	}

	private function createThumb(ImageFile $imageFile, int $width) {
		return $imageFile->getOrCreateThumb($this->createStrategy($width));
	}

	private function createVariation(ImageFile $imageFile, int $width) {
		$strategy = $this->createStrategy($width);
		if ($strategy->matches($imageFile->getImageSource())) {
			return null;
		}

		return $imageFile->getOrCreateVariation($strategy);
	}
}