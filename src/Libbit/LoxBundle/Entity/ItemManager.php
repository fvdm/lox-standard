<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\ORM\EntityManager;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Rednose\FrameworkBundle\Entity\User;

class ItemManager
{
    protected $em;

    protected $repository;

    public function __construct(EntityManager $em)
    {
        $this->em         = $em;
        $this->repository = $em->getRepository('Libbit\LoxBundle\Entity\Item');
    }

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

    public function createFileItem(User $user, $parent = null)
    {
        $item = $this->createItem($user, $parent);

        $item->setIsDir(false);

        return $item;
    }

    public function createFolderItem(User $user, $parent = null)
    {
        $item = $this->createItem($user, $parent);

        $item->setIsDir(true);

        return $item;
    }

    public function saveItem($item, $silent = false)
    {
        $this->em->persist($item);

        if ($silent === false) {
            $this->em->flush();
        }
    }

    public function removeItem($item, $silent = false)
    {
        $this->em->remove($item);

        if ($silent === false) {
            $this->em->flush();
        }
    }

    public function moveItem($item, $parent, $title = null)
    {
        // If the item is a share, move to the share instead.
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

    public function copyItem($item, $parent, $title = null)
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

        $share->setTitle($item->getTitle());

        $share->setOwner($user);
        $share->setShareOf($item);

        $this->saveItem($share);

        return $share;
    }

    public function removeFolderShare(Item $share, User $user)
    {
        $item = $this->repository->findOneBy(array(
            'shareOf' => $share,
            'owner'   => $user,
        ));

        $this->em->remove($item);
        $this->em->flush();
    }

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

    public function findItemByPath(User $user, $path)
    {
        $parts = preg_split('@/@', $path, null, PREG_SPLIT_NO_EMPTY);

        $item = $this->getRootItem($user);

        foreach ($parts as $part) {
            $item = $this->getChildNamed($part, $item);

            if ($item === null) {
                return null;
            }
        }

        return $item;
    }

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

    public function getHash($item)
    {
        $hash = md5(serialize($item->getModifiedAt()));

        foreach (($item->hasShareOf() ? $item->getShareOf()->getChildren() : $item->getChildren()) as $child) {
            $hash = md5($hash.md5(serialize($child->getModifiedAt())));
        }

        return $hash;
    }

    /**
     * Returns a child with a given name.
     *
     * If this is a share, it will return the shared item instance and never the source share.
     *
     * @param string $name
     * @param Item $parent
     *
     * @return Item
     */
    protected function getChildNamed($name, Item $parent)
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

        return $item;
    }

    protected function createCopy($item)
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
