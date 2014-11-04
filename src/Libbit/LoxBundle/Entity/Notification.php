<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\Annotation as Serializer;
use Symfony\Component\Validator\Constraints as Assert;
use Rednose\FrameworkBundle\Entity\User;
use Rednose\FrameworkBundle\Model\Notification as BaseNotification;

/**
 * @ORM\Entity()
 * @ORM\Table(name="libbit_lox_notification")
 * @ORM\HasLifecycleCallbacks()
 */
class Notification extends BaseNotification
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
    protected $owner;

    /**
     * @ORM\ManyToOne(targetEntity="Rednose\FrameworkBundle\Entity\User")
     * @Assert\Regex("/[0-9]+/")
     *
     * @ORM\JoinColumn(
     *   name="user_id",
     *   referencedColumnName="id",
     *   onDelete="CASCADE")
     */
    protected $user;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $createdAt;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     * @Assert\DateTime()
     */
    protected $readAt;

    /**
     * @ORM\Column(type="string")
     */
    protected $type;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $status;

    /**
     * @ORM\ManyToOne(targetEntity="Libbit\LoxBundle\Entity\Item")
     *
     * @ORM\JoinColumn(
     *   name="item_id",
     *   referencedColumnName="id",
     *   onDelete="CASCADE")
     */
    protected $item;

    /**
     * @ORM\ManyToOne(targetEntity="Libbit\LoxBundle\Entity\Link")
     *
     * @ORM\JoinColumn(
     *   name="link_id",
     *   referencedColumnName="id",
     *   onDelete="CASCADE")
     */
    protected $link;

    /**
     * @ORM\ManyToOne(targetEntity="Libbit\LoxBundle\Entity\Invitation")
     *
     * @ORM\JoinColumn(
     *   name="invite_id",
     *   referencedColumnName="id",
     *   onDelete="CASCADE")
     */
    protected $invite;

    public function getItem()
    {
        return $this->item;
    }

    public function setItem($item)
    {
        $this->item = $item;
    }

    public function getLink()
    {
        return $this->link;
    }

    public function setLink($link)
    {
        $this->link = $link;
    }

    public function getInvite()
    {
        return $this->invite;
    }

    public function setInvite($invite)
    {
        $this->invite = $invite;
    }

    // -- Lifecycle Callback Methods -------------------------------------------

    /**
     * @ORM\PrePersist
     */
    public function setCreatedAtValue()
    {
        $this->createdAt = new \DateTime();
    }
}
