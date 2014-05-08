<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\Annotation as Serializer;
use Symfony\Component\Validator\Constraints as Assert;
use Rednose\FrameworkBundle\Entity\User;

/**
 * @ORM\Entity()
 * @ORM\Table(name="libbit_lox_link")
 * @ORM\HasLifecycleCallbacks()
 */
class Link
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     *
     * @Serializer\Groups({"list", "details"})
     */
    protected $id;

    /**
     * @ORM\ManyToOne(targetEntity="Rednose\FrameworkBundle\Entity\User")
     *
     * @ORM\JoinColumn(
     *   name="owner_id",
     *   referencedColumnName="id",
     *   onDelete="CASCADE")
     */
    protected $owner;

    /**
     * @ORM\Column(type="string")
     *
     * @Serializer\Groups({"details"})
     */
    protected $publicId;

    /**
     * @ORM\Column(type="datetime")
     *
     * @Serializer\Groups({"details"})
     */
    protected $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity="Libbit\LoxBundle\Entity\Item", inversedBy="links")
     * @ORM\JoinColumn(name="item_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $item;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->publicId  = uniqid();
    }

    public function getId()
    {
        return $this->id;
    }

    public function setOwner(User $owner)
    {
        $this->owner = $owner;
    }

    public function getOwner()
    {
        return $this->owner;
    }

    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    public function getPublicId()
    {
        return $this->publicId;
    }

    public function setPublicId($publicId)
    {
        $this->publicId = $publicId;
    }

    public function getItem()
    {
        return $this->item;
    }

    public function setItem(Item $item)
    {
        $this->item = $item;
    }

    public function getUri()
    {
        return $this->publicId.'/'.$this->item->getTitle();
    }
}
