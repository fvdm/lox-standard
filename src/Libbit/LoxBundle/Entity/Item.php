<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\Annotation as Serializer;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Annotation as Vich;
use Rednose\FrameworkBundle\Entity\User;
use Doctrine\ORM\Mapping\UniqueConstraint;

/**
 * @ORM\Entity()
 * @ORM\Table(name="libbit_lox_item", uniqueConstraints={@UniqueConstraint(name="item_unique", columns={"owner_id", "isDir", "parent_id", "title"})})
 * @ORM\HasLifecycleCallbacks()
 *
 * @Vich\Uploadable
 */
class Item
{
	const ROOT = 'Home';

    /**
     * @Assert\Regex("/[0-9]+/")
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
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
	 * Whether the current item is a folder or not.
	 *
     * @ORM\Column(type="boolean")
     *
     * @Serializer\Groups({"list", "details", "tree"})
     */
	protected $isDir;

    /**
     * Title of the file or folder.
     *
     * @Assert\Regex("/[\w ]+/")
     * @ORM\Column(type="string")
     *
     * @Serializer\Groups({"list", "details", "tree"})
     */
	protected $title;

    /**
     * @ORM\Column(type="datetime")
     * @Assert\DateTime()
     */
	protected $createdAt;

    /**
     * The date and time the file was last modified.
     *
     * @ORM\Column(type="datetime")
     *
     * @Serializer\Groups({"list", "details", "tree"})
     */
	protected $modifiedAt;

    /**
     * @ORM\OneToMany(targetEntity="Libbit\LoxBundle\Entity\Item", mappedBy="parent", cascade={"persist", "remove"})
     * @ORM\OrderBy({"title" = "ASC"})
     */
	protected $children;

    /**
     * @ORM\ManyToOne(targetEntity="Libbit\LoxBundle\Entity\Item", inversedBy="children")
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", onDelete="CASCADE")
     */
	protected $parent;

    /**
     * @ORM\ManyToOne(targetEntity="Libbit\LoxBundle\Entity\Item", inversedBy="shares")
     * @ORM\JoinColumn(name="share_of_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $shareOf;

    /**
     * @ORM\OneToMany(targetEntity="Libbit\LoxBundle\Entity\Item", mappedBy="shareOf")
     */
    protected $shares;

    /**
     * @ORM\OneToOne(targetEntity="Share", mappedBy="item")
     */
    protected $share;

    /**
     * @ORM\OneToOne(targetEntity="Libbit\LoxBundle\Entity\Link", mappedBy="item")
     *
     * @Serializer\Groups({"details"})
     */
    protected $link;

    /**
     * @ORM\OneToMany(targetEntity="Libbit\LoxBundle\Entity\ItemKey", mappedBy="item", cascade={"persist", "remove"})
     */
    protected $keys;

    /**
     * @ORM\OneToMany(targetEntity="Libbit\LoxBundle\Entity\Revision", mappedBy="item", cascade={"persist", "remove"})
     * @ORM\OrderBy({"revision" = "DESC"})
     */
    protected $revisions;

    // -- Serializer Properties ------------------------------------------------

    /**
	 * The full path to the file or folder.
	 *
     * @Serializer\Type("string")
     * @Serializer\Groups({"list", "details", "tree"})
     */
	protected $path;

    /**
     * Whether this folder is shared with others.
     *
     * @Serializer\Type("boolean")
     * @Serializer\Accessor(getter="isShared")
     * @Serializer\Groups({"list", "details", "tree"})
     */
    protected $isShared;

    /**
	 * Whether the folder is a shared folder.
	 *
     * @Serializer\Type("boolean")
     * @Serializer\Accessor(getter="isShare")
     * @Serializer\Groups({"list", "details", "tree"})
     */
	protected $isShare;

    /**
	 * Whether this folder and its children are encrypted (has as set
	 * of encryption keys).
	 *
     * @Serializer\Type("boolean")
     * @Serializer\Accessor(getter="hasKeys")
     * @Serializer\Groups({"list", "details", "tree"})
     */
	protected $hasKeys;

    /**
	 * The contents of a given folder.
	 *
     * @Serializer\SerializedName("children")
     * @Serializer\Type("array")
     * @Serializer\Accessor(getter="getMappedChildren")
     * @Serializer\MaxDepth(1)
     * @Serializer\Groups({"web", "api"})
     */
	protected $content;

    /**
     * The content type of a file.
     *
     * @Serializer\Type("string")
     * @Serializer\Accessor(getter="getMimeType")
     * @Serializer\Groups({"list", "details"})
     */
    protected $mimeType;

    /**
     * The size of a given file.
     *
     * @Serializer\Type("integer")
     * @Serializer\Accessor(getter="getSize")
     * @Serializer\Groups({"list", "details"})
     */
    protected $size;

    /**
     * The icon for this item.
     *
     * @Serializer\Type("string")
     * @Serializer\Groups({"list", "details"})
     */
    protected $icon;

    /**
     * The revision of a given file.
     *
     * @Serializer\Type("integer")
     * @Serializer\Accessor(getter="getRevisionNo")
     * @Serializer\Groups({"list", "details"})
     */
    protected $revision;

    /**
     * The contents of a given folder.
     *
     * @Serializer\SerializedName("children")
     * @Serializer\Type("array")
     * @Serializer\Accessor(getter="getTreeChildren")
     * @Serializer\Groups({"tree"})
     */
    protected $treeContent;

    /**
	 * Hash of the folder state, only changes when the folder or it's content changes.
	 * Can be used in subsequent requests by specifying the <code>hash</code> parameter,
	 * the API will return a <code>304 Not Modified</code> status code when the folder hasn't changed.
	 *
     * @Serializer\Type("boolean")
     * @Serializer\Groups({"details", "api"})
     */
	protected $hash;

	public function __construct()
	{
        $this->isDir     = true;
        $this->keys      = new ArrayCollection;
        $this->children  = new ArrayCollection;
        $this->shares    = new ArrayCollection;
        $this->revisions = new ArrayCollection;
	}

    /**
     * @return integer
     */
    public function getId()
	{
		return $this->id;
	}

    /**
     * @return bool
     */
    public function getIsDir()
	{
		return $this->isDir;
	}

    /**
     * @param User $owner
     */
    public function setOwner($owner)
	{
		$this->owner = $owner;
	}

    /**
     * @return User
     */
    public function getOwner()
	{
		return $this->owner;
	}

    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    public function getModifiedAt()
    {
        return $this->modifiedAt;
    }

	public function setIsDir($isDir)
	{
		$this->isDir = $isDir;
	}

	public function getTitle()
	{
		return $this->title;
	}

	public function setTitle($title)
	{
		$this->title = $title;
	}

    /**
     * @return Item
     */
    public function getParent()
	{
		return $this->parent;
	}

	public function getLink()
	{
		return $this->link;
	}

	public function setParent($parent)
	{
		$this->parent = $parent;
	}

	public function hasParent()
	{
		return $this->parent !== null;
	}

    public function addChild(Item $child)
    {
        $child->setParent($this);

        $this->children->add($child);
    }

    public function setChildren($children)
    {
        $this->children = $children;
    }

	public function getChildren()
	{
		return $this->children;
	}

    /**
     * @return bool
     */
    public function hasChildren()
	{
		return $this->children !== null && $this->children->isEmpty() === false;
	}

    /**
     * @return Item
     */
    public function getShareOf()
	{
		return $this->shareOf;
	}

    /**
     * @param Item $shareOf
     */
	public function setShareOf($shareOf)
	{
		$this->shareOf = $shareOf;
	}

    /**
     * @return bool
     */
    public function hasShareOf()
	{
		return $this->shareOf !== null;
	}

    /**
     * @return Item[]
     */
	public function getShares()
	{
		return $this->shares;
	}

    /**
     * @return bool
     */
	public function hasShares()
	{
		return $this->shares->isEmpty() === false;
	}

	public function getShare()
	{
		return $this->share;
	}

    public function addKey($key)
    {
        $key->setItem($this);

        $this->keys->add($key);
    }

    public function getKeys()
    {
        return $this->keys;
    }

    /**
     * @return bool
     */
    public function hasKeys()
    {
        if ($this->hasShareOf()) {
            return ($this->shareOf->getKeys()->count() > 0);
        }

        return ($this->keys->count() > 0);
    }

    public function addRevision(Revision $revision)
    {
        $revision->setItem($this);

        $this->revisions->add($revision);

        $revision->setRevision($this->revisions->count());

        $this->setModifiedAtValue();
    }

    public function getRevisions()
    {
        return $this->revisions;
    }

    public function getRevision($revision = null)
    {
        if ($revision === null) {
            if ($this->revisions === null || $this->revisions->count() === 0) {
                return null;
            }

            return $this->revisions->first();
        }

        foreach ($this->revisions as $r) {
            if ($r->getRevision() === $revision) {
                return $r;
            }
        }

        return null;
    }

    /**
     * Returns a share pointer of this share for a given user.
     *
     * @param User $user
     *
     * @return Item
     */
    public function getShareForUser(User $user)
    {
        // Return null if this item is a share pointer itself, or if it isn't shared at all
        if ($this->isShare() || !$this->isShared()) {
            return null;
        }

        foreach ($this->getShares() as $pointer) {
            if ($pointer->getOwner()->isEqualTo($user)) {
                return $pointer;
            }
        }

        return null;
    }

    // -- Lifecycle Callback Methods -------------------------------------------

    /**
     * @ORM\PrePersist
     */
    public function setCreatedAtValue()
    {
        $this->createdAt  = new \DateTime();
        $this->modifiedAt = new \DateTime();
    }

    /**
     * @ORM\PreUpdate
     */
    public function setModifiedAtValue()
    {
        $this->modifiedAt = new \DateTime();
    }

    // -- Serializer Methods ---------------------------------------------------

    public function getMappedChildren()
    {
        if ($this->hasShareOf() === true) {
            if ($this->getShareOf()->hasChildren() === false) {
                return null;
            }

            return $this->getShareOf()->getChildren();
        }

        if ($this->hasChildren() === false) {
            return null;
        }

        return $this->getChildren();
    }

    public function getTreeChildren()
    {
        if ($this->getMappedChildren() === null) {
            return null;
        }

        return $this->getMappedChildren()->filter(
            function($child) {
                return $child->getIsDir();
            }
        );
    }

    /**
     * @return bool
     */
    public function isShare()
    {
        return $this->hasShareOf();
    }

    /**
     * @return bool
     */
    public function isShared()
    {
        return $this->share !== null;
    }

    public function getSize()
    {
        if ($this->getIsDir() === true) {
            return null;
        }

        if ($this->getRevision() === null) {
            return null;
        }

        return $this->getRevision()->getFile()->getSize();
    }

    public function getRevisionNo()
    {
        if ($this->getIsDir() === true) {
            return null;
        }

        if ($this->getRevision() === null) {
            return null;
        }

        return $this->getRevision()->getRevision();
    }

    // XXX
    public function getMimeType()
    {
        if ($this->getIsDir() === true) {
            return null;
        }

        if ($this->getRevision() === null) {
            return null;
        }

        // XXX
        if ($this->getFileExtension() === 'docx') {
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        if ($this->getFileExtension() === 'dotx') {
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.template';
        }

        return $this->getRevision()->getFile()->getMimeType();
    }

    // XXX
    public function getFileExtension()
    {
        return substr(strrchr($this->title, '.') ,1);
    }
}
