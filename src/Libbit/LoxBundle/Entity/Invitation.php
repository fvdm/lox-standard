<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\Annotation as Serializer;
use Symfony\Component\Validator\Constraints as Assert;
use Rednose\FrameworkBundle\Entity\User;

/**
 * @ORM\Entity()
 * @ORM\Table(name="libbit_lox_invitation")
 */
class Invitation
{
    const STATE_PENDING  = 'pending';
    const STATE_ACCEPTED = 'accepted';
    const STATE_REVOKED  = 'revoked';

    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     *
     * @Serializer\Groups({"details"})
     */
    protected $id;

    /**
     * @Serializer\Groups({"details"})
     *
     * @ORM\Column(type="datetime")
     */
    protected $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity="Rednose\FrameworkBundle\Entity\User")
     * @ORM\JoinColumn(name="sender_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $sender;

    /**
     * @ORM\ManyToOne(targetEntity="Rednose\FrameworkBundle\Entity\User")
     * @ORM\JoinColumn(name="receiver_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $receiver;

    /**
     * @Serializer\Groups({"details"})
     *
     * @ORM\Column(type="string")
     */
    protected $state;

    /**
     * @Serializer\Groups({"details"})
     *
     * @ORM\ManyToOne(targetEntity="Libbit\LoxBundle\Entity\Share")
     * @ORM\JoinColumn(name="share_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $share;

    /**
     * The shared folder entry in the user's tree.
     *
     * @Serializer\Groups({"details"})
     *
     * @ORM\ManyToOne(targetEntity="Libbit\LoxBundle\Entity\Item")
     * @ORM\JoinColumn(name="item_id", referencedColumnName="id", onDelete="SET NULL")
     */
    protected $item;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->state     = self::STATE_PENDING;
    }

    public function getId()
    {
        return $this->id;
    }

    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    public function setSender(User $sender)
    {
        $this->sender = $sender;
    }

    public function getSender()
    {
        return $this->sender;
    }

    public function setReceiver(User $receiver)
    {
        $this->receiver = $receiver;
    }

    public function getReceiver()
    {
        return $this->receiver;
    }

    public function setState($state)
    {
        $this->state = $state;
    }

    public function getState()
    {
        return $this->state;
    }

    public function setShare(Share $share)
    {
        $this->share = $share;
    }

    public function getShare()
    {
        return $this->share;
    }

    public function setItem(Item $item)
    {
        $this->item = $item;
    }

    public function getItem()
    {
        return $this->item;
    }
}
