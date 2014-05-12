<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\ORM\EntityManager;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Security\Core\SecurityContext;
use Rednose\FrameworkBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class ItemManager
{
    /**
     * @var EntityManager
     */
    protected $em;

    /**
     * @var SecurityContext
     */
    protected $securityContext;

    /**
     * @var EntityRepository
     */
    protected $repository;

    /**
     * @var EntityRepository
     */
    protected $keyRepository;

    /**
     * Constructor.
     *
     * @param EntityManager   $em
     * @param SecurityContext $securityContext
     */
    public function __construct(EntityManager $em, SecurityContext $securityContext)
    {
        $this->em              = $em;
        $this->repository      = $em->getRepository('Libbit\LoxBundle\Entity\Item');
        $this->keyRepository   = $em->getRepository('Libbit\LoxBundle\Entity\ItemKey');
        $this->securityContext = $securityContext;
    }

    /**
     * Creates a required root item for a given user.
     *
     * @param User $user
     *
     * @return Item
     *
     * @throws \RuntimeException
     */
    public function createRootItem(User $user)
    {
        if ($this->getRootItem($user) !== null) {
            throw new \RuntimeException('User already has a root item.');
        }

        $item = new Item;

        $item->setTitle(Item::ROOT);
        $item->setIsDir(true);
        $item->setOwner($user);

        return $item;
    }

    /**
     * Creates a new item.
     *
     * @param User $user
     * @param Item $parent
     *
     * @return Item
     */
    public function createItem(User $user, $parent = null)
    {
        $item = new Item;

        if ($parent && ($parent->hasShareOf() === true)) {
            $parent = $parent->getShareOf();
        }

        $item->setOwner($user);
        $item->setParent($parent ? $parent : $this->getRootItem($user));

        return $item;
    }

    /**
     * Creates a new file item.
     *
     * @param User $user
     * @param Item $parent
     *
     * @return Item
     */
    public function createFileItem(User $user, $parent = null)
    {
        $item = $this->createItem($user, $parent);

        $item->setIsDir(false);

        return $item;
    }

    /**
     * Creates a folder item.
     *
     * @param User $user
     * @param Item $parent
     *
     * @return Item
     */
    public function createFolderItem(User $user, $parent = null)
    {
        $item = $this->createItem($user, $parent);

        $item->setIsDir(true);

        return $item;
    }

    /**
     * @param Item $item
     *
     * @return bool
     */
    public function isOrIsInsideSharedFolder(Item $item)
    {
        if ($item->isShared() || $item->isShare()) {
            return true;
        }

        if ($item->getParent() === null) {
            return false;
        }

        return $this->isOrIsInsideSharedFolder($item->getParent());
    }

    /**
     * Adds or replaces a ItemKey for the supplied Item
     *
     * @param Item $item
     * @param User $user
     * @param string $key   The base64 encoded key
     * @param string $iv    The base64 encoded iv
     *
     * @return boolean
     */
    public function addItemKey(Item $item, User $user, $key, $iv)
    {
        $owner = $this->securityContext->getToken()->getUser();

        $itemKey = new ItemKey;
        $itemKey->setKey($key);
        $itemKey->setIv($iv);
        $itemKey->setOwner($owner);
        $itemKey->setItem($item);

        if ($item->getOwner()->getId() !== $owner->getId()) {
            return false;
        }

        // If there is a existing item key remove it
        if ($existingItemKey = $this->keyRepository->findOneBy(array('owner' => $owner, 'item' => $item))) {
            $this->em->remove($existingItemKey);
        }

        $this->em->persist($itemKey);
        $this->em->flush();

        return true;
    }

    /**
     * Gets the key and iv for an item
     *
     * @param Item $item
     * @param User $user
     *
     * @return mixed ItemKey or false on failure
     */
    public function getItemKey(Item $item, User $user)
    {
        if ($key = $this->keyRepository->findOneBy(array('owner' => $user, 'item' => $item))) {
            return $key;
        }

        return false;
    }

    /**
     * Revokes an ItemKey
     *
     * @param Item $item
     * @param User $user
     *
     * @return mixed ItemKey or false on failure
     */
    public function revokeItemKey(Item $item, User $user)
    {
        $owner = $this->securityContext->getToken()->getUser();

        if ($key = $this->keyRepository->findOneBy(array('owner' => $user, 'item' => $item))) {
            if ($key->getOwner()->getId() !== $owner->getId()) {
                return false;
            }

            $this->em->remove($key);
            $this->em->flush();
        } else {
            return false;
        }

        return true;
    }

    /**
     * Persists an item to the backend.
     *
     * @param Item $item
     * @param bool $silent
     */
    public function saveItem(Item $item, $silent = false)
    {
        $this->em->persist($item);

        if ($silent === false) {
            $this->em->flush();
        }
    }

    /**
     * Removes an item from the backend.
     *
     * @param Item $item
     * @param bool $silent
     */
    public function removeItem($item, $silent = false)
    {
        $this->em->remove($item);

        if ($silent === false) {
            $this->em->flush();
        }
    }

    /**
     * Moves an item to another parent.
     *
     * @param Item   $item
     * @param Item   $parent
     * @param string $title
     *
     * @return Item
     */
    public function moveItem(Item $item, Item $parent, $title = null)
    {
        // If the item is inside a share, move to the share instead.
        if ($parent->hasShareOf() === true) {
            $parent = $parent->getShareOf();
        }

        $item->setParent($parent);

        if ($title !== null) {
            $item->setTitle($title);
        }

        $this->saveItem($item);

        return $item;
    }

    /**
     * Copies an item to another parent.
     *
     * @param Item   $item
     * @param Item   $parent
     * @param string $title
     *
     * @return Item
     *
     * @throws \RuntimeException
     */
    public function copyItem(Item $item, Item $parent, $title = null)
    {
        // If the item is a share, move the share instead.
        if ($parent->hasShareOf() === true) {
            $parent = $parent->getShareOf();
        }

        // Confirm that the item itself isn't a share.
        if ($item->hasShareOf() || $item->hasShares()) {
            throw new \RuntimeException('Can\'t copy shared items.');
        }

        $copy = $this->createCopy($item);

        $copy->setParent($parent);

        if ($title !== null) {
            $copy->setTitle($title);
        }

        $this->saveItem($copy);

        return $copy;
    }

    /**
     * Create a share item for a given folder item.
     *
     * @param Item $item
     * @param User $user
     *
     * @return Item
     *
     * @throws \RuntimeException
     */
    public function createFolderShare(Item $item, User $user)
    {
        // Confirm that the item is a folder.
        if ($item->getIsDir() === false) {
            throw new \RuntimeException('Can\'t share file items, just folders.');
        }

        // Confirm that the user isn't the same.
        if ($item->getOwner()->isEqualTo($user) === true) {
            throw new \RuntimeException('Can\'t share an item with the owner.');
        }

        $share = $this->createFolderItem($user, $this->getRootItem($user));

        $title = $item->getTitle();

        if ($this->findItemByPath($user, '/'.$title) !== null) {
            $title = $this->incrementTitle($user, $title);
        }

        $share->setTitle($title);

        $share->setOwner($user);
        $share->setShareOf($item);

        $this->saveItem($share);

        return $share;
    }

    /**
     * Removes a share item.
     *
     * @param Item $share
     * @param User $user
     */
    public function removeFolderShare(Item $share, User $user)
    {
        $item = $this->repository->findOneBy(array(
            'shareOf' => $share,
            'owner'   => $user,
        ));

        $this->em->remove($item);
        $this->em->flush();
    }

    /**
     * Returns all joined folders for a given user.
     *
     * @param User $user
     *
     * @return Item[]
     */
    public function findJoinsByUser(User $user)
    {
        $qb = $this->em->createQueryBuilder();

        return $qb->select('i')
            ->from('Libbit\LoxBundle\Entity\Item', 'i')
            ->where($qb->expr()->andx(
                $qb->expr()->equal('i.owner', ':owner'),
                $qb->expr()->isNotNull('i.shareOf')
            ))
            ->setParameter('owner', $user)
            ->getQuery()
            ->getResult();
    }

    /**
     * Generates a (virtual) path to a given item for a given user.
     *
     * @param User $user
     * @param Item $item
     * @param bool $trim
     *
     * @return string
     */
    public function getPathForUser(User $user, Item $item, $trim = false)
    {
        $node = $this->getShareFromFolder($user, $item);

        $path = '/'.$node->getTitle();

        while ($node->hasParent() === true) {
	    // If the item belongs to the current user, it is a folder or shared folder.
	    $node = $this->getShareFromFolder($user, $node->getParent());

            $path = '/'.$node->getTitle().$path;
        }

        // Remove leading Home directory name.
        $path = substr($path, strlen(Item::ROOT) + 1);

        if ($path === false) {
            return '/';
        }

        return $trim === true ? trim($path, '/') : $path;
    }

    /**
     * Check if the current folder is owned by the user. If it isn't,
     * this is a share and we return the pointer to the folder.
     */
    public function getShareFromFolder(User $user, $item)
    {
        if ($item->getOwner()->isEqualTo($user) === false) {
            // This is a share, swap the parent with the pointer to the folder.
	    foreach ($item->getShares() as $share) {
	        if ($share->getOwner()->isEqualTo($user)) {
                    return $share;
                }
            }
        }

        return $item;
    }

    /**
     * Returns the item within a (virtual) path for a given user.
     *
     * @param User   $user
     * @param string $path
     * @param bool   $source
     *
     * @return Item
     */
    public function findItemByPath(User $user, $path, $source = true)
    {
        $parts = preg_split('@/@', $path, null, PREG_SPLIT_NO_EMPTY);

        $item = $this->getRootItem($user);

        foreach ($parts as $part) {
            $item = $this->getChildNamed($part, $item, $source);

            if ($item === null) {
                return null;
            }
        }

        return $item;
    }

    /**
     * Returns the root item for a given user.
     *
     * @param User $user
     *
     * @return Item
     */
    public function getRootItem(User $user)
    {
        $item = $this->em->createQueryBuilder()
            ->select('i')
            ->from('Libbit\LoxBundle\Entity\Item', 'i')
            ->where('i.title = :title')
            ->andWhere('i.owner = :owner')
            ->setParameter('title', Item::ROOT)
            ->setParameter('owner', $user)
            ->getQuery()
            ->getOneOrNullResult();

        return $item;
    }

    /**
     * Creates a unique has for a given folder state.
     *
     * @param Item $item
     *
     * @return string
     */
    public function getHash(Item $item)
    {
        $hash = md5(serialize($item->getModifiedAt()));

        foreach (($item->hasShareOf() ? $item->getShareOf()->getChildren() : $item->getChildren()) as $child) {
            $hash = md5($hash.md5(serialize($child->getModifiedAt())));
        }

        return $hash;
    }

    /**
     * @param User   $user
     * @param string $title
     * @param Item   $parent
     * @param int    $index
     *
     * @return string
     */
    public function incrementTitle(User $user, $title, $parent = null, $index = 1)
    {
        $parts = pathinfo($title);

        $newTitle = $parts['filename'].' ('.$index.')';

        if (isset($parts['extension'])) {
            $newTitle .= '.'.$parts['extension'];
        }

        if ($this->findItemByPath($user, $newTitle) !== null) {
            return $this->incrementTitle($user, $title, $parent, $index + 1);
        }

        return $newTitle;
    }
    /**
     * Returns a child with a given name.
     *
     * If the item is a share, it will return the source share.
     *
     * @param string $name
     * @param Item   $parent
     * @param bool   $source
     *
     * @return Item
     */
    protected function getChildNamed($name, Item $parent, $source = true)
    {
        $item = $this->em->createQueryBuilder()
            ->select('i')
            ->from('Libbit\LoxBundle\Entity\Item', 'i')
            ->where('i.title = :title')
            ->andWhere('i.parent = :parent')
            ->setParameter('title', $name)
            ->setParameter('parent', $parent->getId())
            ->getQuery()
            ->getOneOrNullResult();

        if ($item === null) {
            return null;
        }

        return $item->hasShareOf() && $source ? $item->getShareOf() : $item;
    }

    /**
     * Returns a copy of a given item.
     *
     * @param Item $item
     *
     * @return Item
     */
    protected function createCopy(Item $item)
    {
        $copy = clone $item;

        // Copy the file if there is one.
        if ($item->getIsDir() === false && $item->getRevision() && $item->getRevision()->getFile()) {
            $tmpFile = tempnam(sys_get_temp_dir(), 'File');

            copy($item->getRevision()->getFile()->getRealPath(), $tmpFile);

            $revision = new Revision;
            $revision->setUser($copy->getOwner());
            $revision->setFile(new UploadedFile($tmpFile, $item->getRevision()->getFile()->getBaseName(), null, null, null, true));

            $copy->addRevision($revision);
            $revision->setRevision(1);
        }

        // Clone the child object before clearing it, else we are clearing by referencing
        // the original item's collection.
        $copy->setChildren(clone $item->getChildren());

        $copy->getChildren()->clear();

        foreach ($item->getChildren() as $child) {
            $copy->addChild($this->createCopy($child));
        }

        return $copy;
    }
}
