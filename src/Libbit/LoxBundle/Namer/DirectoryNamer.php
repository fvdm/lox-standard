<?php

namespace Libbit\LoxBundle\Namer;

use Vich\UploaderBundle\Naming\DirectoryNamerInterface;

/**
 * Namer class.
 */
class DirectoryNamer implements DirectoryNamerInterface
{
    /**
     * Creates a directory name for the file being uploaded.
     *
     * @param object $obj The object the upload is attached to.
     * @param string $field The name of the uploadable field to generate a name for.
     * @param string $uploadDir The upload directory set in config
     *
     * @return string The directory name.
     */
    public function directoryName($obj, $field, $uploadDir)
    {
        if ($obj->getFilePath() === false) {
            $dir = $this->getDirectory();

            $obj->setFilePath($dir . "/" . rand(0, 9));
        }

        return $uploadDir . "/" . $obj->getFilePath();
    }

    /**
     * Get a pseusdo random directory name based on internal logic
     * The maxumum amount of the combinations is 30.000 to avoid inodes overloads.
     *
     * @return string A pseusdo random directory
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
