<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\Annotation as Serializer;
use Symfony\Component\Validator\Constraints as Assert;
use Rednose\FrameworkBundle\Entity\User;
use Rednose\FrameworkBundle\Entity\Group;

/**
 * @ORM\Entity()
 * @ORM\Table(name="libbit_lox_share")
 */
class Share
{
    /**
     * Internal share id
     *
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     *
     * @Serializer\Groups({"list", "details"})
     */
    protected $id;

    /**
     * The item (folder) that is shared
     *
     * @ORM\OneToOne(targetEntity="Libbit\LoxBundle\Entity\Item")
     * @ORM\JoinColumn(name="item_id", referencedColumnName="id", onDelete="CASCADE")
     *
     * @Serializer\Groups({"details", "list"})
     */
    protected $item;

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
     * @ORM\Column(type="datetime")
     */
    protected $createdAt;

    /**
     * @ORM\ManyToMany(targetEntity="Rednose\FrameworkBundle\Entity\User")
     * @ORM\JoinTable(name="libbit_lox_shares_users",
     *   joinColumns={@ORM\JoinColumn(name="share_id", referencedColumnName="id", onDelete="CASCADE")},
     *   inverseJoinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="id")}
     * )
     */
    protected $users;

    /**
     * @ORM\ManyToMany(targetEntity="Rednose\FrameworkBundle\Entity\Group")
     * @ORM\JoinTable(name="libbit_lox_shares_groups",
     *   joinColumns={@ORM\JoinColumn(name="share_id", referencedColumnName="id", onDelete="CASCADE")},
     *   inverseJoinColumns={@ORM\JoinColumn(name="group_id", referencedColumnName="id")}
     * )
     */
    protected $groups;

    /**
     * The identities that this item is shared with.
     * Either individual users, or entire groups.
     *
     * @Serializer\Type("array")
     * @Serializer\Accessor(getter="getIdentities")
     * @Serializer\Groups({"details"})
     */
    protected $identities;

    public function __construct()
    {
        $this->createdAt = new \DateTime();

        $this->users  = new ArrayCollection;
        $this->groups = new ArrayCollection;
    }

    public function getId()
    {
        return $this->id;
    }

    public function setItem(Item $item)
    {
        $this->item = $item;
    }

    public function getItem()
    {
        return $this->item;
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

    public function setUsers(ArrayCollection $users)
    {
        $this->users = $users;
    }

    public function getUsers()
    {
        return $this->users;
    }

    public function setGroups(ArrayCollection $groups)
    {
        $this->groups = $groups;
    }

    public function getGroups()
    {
        return $this->groups;
    }

    // -- Serializer Methods ---------------------------------------------------

    public function getIdentities()
    {
        $serializedGroups = array();
        $serializedUsers  = array();

        foreach ($this->getGroups() as $group) {
            $serializedGroups[] = array(
                'id'    => 'group_'.$group->getId(),
                'title' => $group->getName(),
                'type'  => 'group',
            );
        }

        foreach ($this->getUsers() as $user) {
            $serializedUsers[] = array(
                'id'    => 'user_'.$user->getId(),
                'title' => $user->getBestName(),
                'type'  => 'user',
            );
        }

        return array_merge($serializedGroups, $serializedUsers);
    }
}
