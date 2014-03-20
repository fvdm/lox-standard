<?php

namespace Rednose\LoxBundle\EventListener;

use Doctrine\ORM\EntityManager;
use Rednose\LoxBundle\Entity\Notification;
use Rednose\LoxBundle\Events;
use Rednose\LoxBundle\Event\LinkEvent;
use Rednose\LoxBundle\Event\InvitationEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Creates web notifications for certain events.
 */
class WebNotificationListener implements EventSubscriberInterface
{
    protected $em;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function afterInvitationSend(InvitationEvent $event)
    {
        $invite = $event->getInvitation();

        $notification = new Notification('Rednose\LoxBundle\Notification\Type\SendInviteNotificationType');
        $notification->setInvite($invite);
        $notification->setOwner($invite->getSender());
        $notification->setUser($invite->getReceiver());
        $notification->setItem($invite->getShare()->getItem());

        $this->em->persist($notification);

        $notification = new Notification('Rednose\LoxBundle\Notification\Type\ReceiveInviteNotificationType');
        $notification->setInvite($invite);
        $notification->setOwner($invite->getReceiver());
        $notification->setUser($invite->getSender());
        $notification->setItem($invite->getShare()->getItem());

        $this->em->persist($notification);
        $this->em->flush();
    }

    public function afterInvitationAccepted(InvitationEvent $event)
    {
        $invite = $event->getInvitation();

        $notification = new Notification('Rednose\LoxBundle\Notification\Type\AcceptInviteNotificationType');
        $notification->setInvite($invite);
        $notification->setOwner($invite->getReceiver());
        $notification->setItem($invite->getItem());

        $this->em->persist($notification);
        $this->em->flush();
    }

    public function afterLinkCreated(LinkEvent $event)
    {
        $link = $event->getLink();

        $notification = new Notification('Rednose\LoxBundle\Notification\Type\CreateLinkNotificationType');
        $notification->setOwner($link->getOwner());
        $notification->setLink($link);

        $this->em->persist($notification);
        $this->em->flush();
    }

    /**
     * @see Symfony\Component\EventDispatcher\EventSubscriberInterface::getSubscribedEvents();
     */
    public static function getSubscribedEvents()
    {
        return array(
            Events::INVITATION_SEND     => 'afterInvitationSend',
            Events::INVITATION_ACCEPTED => 'afterInvitationAccepted',
            Events::LINK_CREATED        => 'afterLinkCreated',
        );
    }
}
