<?php

namespace Rednose\LoxBundle\Entity;

use Doctrine\ORM\EntityManager;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Rednose\FrameworkBundle\Entity\User;
use Rednose\LoxBundle\Events;
use Rednose\LoxBundle\Event\LinkEvent;

class LinkManager
{
    protected $dispatcher;

    protected $em;

    protected $repository;

    public function __construct(EventDispatcherInterface $dispatcher, EntityManager $em)
    {
        $this->dispatcher = $dispatcher;
        $this->em         = $em;
        $this->repository = $em->getRepository('Rednose\LoxBundle\Entity\Link');
    }

    public function createLink(Item $item, User $user)
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

        $this->em->persist($link);
        $this->em->flush();

        $event = new LinkEvent($link);
        $this->dispatcher->dispatch(Events::LINK_CREATED, $event);

        return $link;
    }

    public function removeLink(Link $link)
    {
        $this->em->remove($link);
        $this->em->flush();
    }

    public function getLinkByPath($path)
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

        return $link;
    }

    public function getLinkByPublicId($id)
    {
        return $this->repository->findOneBy(array(
            'publicId' => $id,
        ));
    }

    public function findLinkByUser(User $user, Item $item)
    {
        return $this->repository->findOneBy(array(
            'owner' => $user->getId(),
            'item'  => $item->getId(),
        ));
    }

    public function findAllByUser(User $user)
    {
        $links = $this->em->createQueryBuilder()
            ->select('l')
            ->from('Rednose\LoxBundle\Entity\Link', 'l')
            ->where('l.owner = :owner')
            ->setParameter('owner', $user)
            ->getQuery()
            ->getResult();

        return $links;
    }
}
