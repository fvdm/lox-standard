<?php

namespace Libbit\LoxBundle\Namer;

use Vich\UploaderBundle\Naming\DirectoryNamerInterface;
use Vich\UploaderBundle\Mapping\PropertyMapping;

/**
 * Namer class.
 */
class DirectoryNamer implements DirectoryNamerInterface
{
    /**
     * Creates a directory name for the file being uploaded.
     *
     * @param object          $object  The object the upload is attached to.
     * @param Propertymapping $mapping The mapping to use to manipulate the given object.
     *
     * @note The $object parameter can be null.
     *
     * @return string The directory name.
     */
    public function directoryName($object, PropertyMapping $mapping)
    {
        if ($object->getFilePath() === false) {
            $dir = $this->getDirectory();

            $object->setFilePath($dir . "/" . rand(0, 9));
        }

        return $mapping->getUploadDestination() . "/" . $object->getFilePath();
    }

    /**
     * Get a pseudo random directory name based on internal logic
     * The maximum amount of the combinations is 30.000 to avoid inodes overloads.
     *
     * @return string A pseudo random directory
     */
    private function getDirectory()
    {
        $folderList = array();

        for ($i = 0; $i <= 30000; $i++) {
            $rand = md5($i * 1337);

            $folderList[] = substr($rand, 0, 12);
        }

        return $folderList[rand(0, 30000)];
    }
}
