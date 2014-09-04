<?php

namespace Libbit\LoxBundle\Entity;

use DateTime;
use Doctrine\ORM\EntityManager;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Rednose\FrameworkBundle\Entity\User;
use Libbit\LoxBundle\Events;
use Libbit\LoxBundle\Event\LinkEvent;
use Doctrine\ORM\EntityRepository;

class LinkManager
{
    /**
     * @var EventDispatcherInterface
     */
    protected $dispatcher;

    /**
     * @var EntityManager
     */
    protected $em;

    /**
     * @var EntityRepository
     */
    protected $repository;

    /**
     * Constructor.
     *
     * @param EventDispatcherInterface $dispatcher
     * @param EntityManager            $em
     */
    public function __construct(EventDispatcherInterface $dispatcher, EntityManager $em)
    {
        $this->dispatcher = $dispatcher;
        $this->em         = $em;
        $this->repository = $em->getRepository('Libbit\LoxBundle\Entity\Link');
    }

    /**
     * @param Item     $item
     * @param User     $user
     * @param DateTime $expires
     *
     * @return Link
     *
     * @throws \InvalidArgumentException
     */
    public function createLink(Item $item, User $user, DateTime $expires = null)
    {
        if ($item instanceof Item === false) {
            throw new \InvalidArgumentException('No item provided.');
        }

        if ($item->getIsDir() === true) {
            throw new \InvalidArgumentException('Creating links to folders isn\'t supported.');
        }

        if ($user instanceof User === false) {
            throw new \InvalidArgumentException('No user provided.');
        }

        $link = new Link;

        $link->setItem($item);
        $link->setOwner($user);
        $link->setExpires($expires);

        $this->em->persist($link);
        $this->em->flush();

        $event = new LinkEvent($link);
        $this->dispatcher->dispatch(Events::LINK_CREATED, $event);

        return $link;
    }

    /**
     * @param integer  $id
     * @param User     $user
     * @param DateTime $expires
     *
     * @return Link
     */
    public function updateLink($id, User $user, DateTime $expires = null)
    {
        if ($link = $this->repository->findOneById($id)) {
            $link->setExpires($expires);

            if ($link->getOwner()->getId() === $user->getId()) {
                $this->em->persist($link);
                $this->em->flush();
            }

            return $link;
        }

        return null;
    }

    /**
     * @param Link $link
     */
    public function removeLink(Link $link)
    {
        $this->em->remove($link);
        $this->em->flush();
    }

    /**
     * @param string $path
     * @param bool   $checkExpired
     *
     * @return Link | false on expired | null on not found
     */
    public function getLinkByPath($path, $checkExpired = false)
    {
        if (false === $pos = strpos($path, '/')) {
            return null;
        }

        $publicId = substr($path, 0, $pos);
        $title    = substr($path, $pos + 1);

        $link = $this->getLinkByPublicId($publicId);

        if ($link === null || $link->getItem()->getTitle() !== $title) {
            return null;
        }

        $now = new \DateTime();

        if ($checkExpired && $link->getExpires() !== null && $link->getExpires()->getTimestamp() < $now->getTimestamp()) {
            return false;
        }

        return $link;
    }

    /**
     * @param integer $id
     *
     * @return Link
     */
    public function getLinkByPublicId($id)
    {
        return $this->repository->findOneBy(array(
            'publicId' => $id,
        ));
    }

    /**
     * @param User $user
     * @param Item $item
     *
     * @return Link
     */
    public function findLinkByUser(User $user, Item $item)
    {
        return $this->repository->findOneBy(array(
            'owner' => $user->getId(),
            'item'  => $item->getId(),
        ));
    }

    /**
     * @param User $user
     *
     * @return Link[]
     */
    public function findAllByUser(User $user)
    {
        $links = $this->em->createQueryBuilder()
            ->select('l')
            ->from('Libbit\LoxBundle\Entity\Link', 'l')
            ->where('l.owner = :owner')
            ->setParameter('owner', $user)
            ->getQuery()
            ->getResult();

        return $links;
    }
}
