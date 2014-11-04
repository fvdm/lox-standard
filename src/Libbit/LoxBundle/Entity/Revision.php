<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\Annotation as Serializer;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Annotation as Vich;
use Symfony\Component\HttpFoundation\File\File;
use Rednose\FrameworkBundle\Entity\User;

/**
 * @ORM\Entity()
 * @ORM\Table(name="libbit_lox_revision")
 * @ORM\HasLifecycleCallbacks()
 *
 * @Vich\Uploadable
 */
class Revision
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @Assert\Regex("/[0-9]+/")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @ORM\ManyToOne(targetEntity="Rednose\FrameworkBundle\Entity\User")
     *
     * @Assert\Regex("/[0-9]+/")
     * @ORM\JoinColumn(
     *   name="owner_id",
     *   referencedColumnName="id",
     *   onDelete="CASCADE")
     */
    protected $user;
    /**
     * @Assert\Regex("/[0-9]+/")
     * @ORM\Column(type="integer")
     */
    protected $revision;

    /**
     * @ORM\Column(type="datetime")
     * @Assert\DateTime()
     */
    protected $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity="Libbit\LoxBundle\Entity\Item", inversedBy="revisions")
     * @ORM\JoinColumn(name="item_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $item;

    /**
     * @Vich\UploadableField(mapping="file", fileNameProperty="fileName")
     *
     * @var File $file
     */
    protected $file;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $filePath;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $fileName;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->hash      = uniqid();
    }

    public function getId()
    {
        return $this->id;
    }

    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    public function getRevision()
    {
        return $this->revision;
    }

    public function setRevision($revision)
    {
        $this->revision = $revision;
    }

    public function getItem()
    {
        return $this->item;
    }

    public function setItem(Item $item)
    {
        $this->item = $item;
    }

    public function setUser($user)
    {
        $this->user = $user;
    }

    public function getUser()
    {
        return $this->user;
    }

    public function getFile()
    {
        return $this->file;
    }

    public function setFile(File $file)
    {
        $this->file = $file;
    }

    public function getFilePath()
    {
        if ($this->filePath === NULL) {
            return false;
        }

        return $this->filePath;
    }

    public function setFilePath($path)
    {
        $this->filePath = $path;
    }

    public function setFileName($name)
    {
        $this->fileName = $name;
    }

    public function getFileName()
    {
        return $this->fileName;
    }
}
