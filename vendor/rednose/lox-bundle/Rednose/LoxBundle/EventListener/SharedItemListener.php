<?php

namespace Rednose\LoxBundle\EventListener;

use Doctrine\ORM\EntityManager;
use Rednose\LoxBundle\Events;
use Rednose\LoxBundle\Entity\ItemManager;
use Rednose\LoxBundle\Event\InvitationEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Creates a shared folder item in a user's tree after a user accepted an invitation.
 */
class SharedItemListener implements EventSubscriberInterface
{
    /**
     * @var ItemManager
     */
    protected $im;

    /**
     * @var EntityManager
     */
    protected $em;

    /**
     * Constructor.
     *
     * @param ItemManager   $im Item manager
     * @param EntityManager $em Entity manager
     */
    public function __construct(ItemManager $im, EntityManager $em)
    {
        $this->im = $im;
        $this->em = $em;
    }

    /**
     * Create a pointer to a shared folder in a user's tree.
     *
     * @param InvitationEvent $event Invitation event
     */
    public function afterInvitationAccepted(InvitationEvent $event)
    {
        $invite = $event->getInvitation();

        $sharedFolder = $this->im->createFolderShare($invite->getShare()->getItem(), $invite->getReceiver());

        $invite->setItem($sharedFolder);

        $this->em->persist($invite);
        $this->em->flush();
    }

    /**
     * Removes the pointer to a shared folder in a user's tree.
     *
     * @param InvitationEvent $event Invitation event
     */
    public function afterInvitationRevoked(InvitationEvent $event)
    {
        $invite = $event->getInvitation();

        $this->im->removeFolderShare($invite->getShare()->getItem(), $invite->getReceiver());
    }

    /**
     * @see Symfony\Component\EventDispatcher\EventSubscriberInterface::getSubscribedEvents();
     */
    public static function getSubscribedEvents()
    {
        return array(
            Events::INVITATION_ACCEPTED => 'afterInvitationAccepted',
            Events::INVITATION_REVOKED  => 'afterInvitationRevoked',
        );
    }
}
