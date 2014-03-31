<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\Annotation as Serializer;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Annotation as Vich;
use Rednose\FrameworkBundle\Entity\User;

/**
 * @ORM\Entity()
 * @ORM\Table(name="libbit_lox_item")
 * @ORM\HasLifecycleCallbacks()
 *
 * @Vich\Uploadable
 */
class Item
{
	// XXX
	const ROOT = 'Home';

    /**
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
     * @ORM\Column(type="string")
     *
     * @Serializer\Groups({"list", "details", "tree"})
     */
	protected $title;

    /**
     * @ORM\Column(type="datetime")
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
     * Wether this folder is shared with others.
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
	 * The contents of a given folder.
	 *
     * @Serializer\SerializedName("children")
     * @Serializer\Type("array")
     * @Serializer\Accessor(getter="getMappedChildren")
     * @Serializer\MaxDepth(1)
     * @Serializer\Groups({"details"})
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
        $this->children  = new ArrayCollection;
        $this->shares    = new ArrayCollection;
        $this->revisions = new ArrayCollection;
	}

	public function getId()
	{
		return $this->id;
	}

	public function getIsDir()
	{
		return $this->isDir;
	}

	public function setOwner($owner)
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

	public function getParent()
	{
		return $this->parent;
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

	public function hasChildren()
	{
		return $this->children !== null && $this->children->isEmpty() === false;
	}

	public function getShareOf()
	{
		return $this->shareOf;
	}

	public function setShareOf($shareOf)
	{
		$this->shareOf = $shareOf;
	}

	public function hasShareOf()
	{
		return $this->shareOf !== null;
	}

	public function getShares()
	{
		return $this->shares;
	}

	public function hasShares()
	{
		return $this->shares->isEmpty() === false;
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

    public function isShare()
    {
        return $this->hasShareOf();
    }

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
