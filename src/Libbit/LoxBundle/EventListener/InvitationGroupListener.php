<?php

namespace Libbit\LoxBundle\EventListener;

use Rednose\FrameworkBundle\Events;
use Rednose\FrameworkBundle\Event\UserEvent;
use Libbit\LoxBundle\Entity\ShareManager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Listens for User / Group mutations and removes or sends invitation
 * based on these changes.
 */
class InvitationGroupListener implements EventSubscriberInterface
{
    protected $sm;

    /**
     * Constructor
     *
     * @param ShareManager $im A concrete share manager
     */
    public function __construct(ShareManager $sm)
    {
        $this->sm = $sm;
    }

    // TODO: Optimize as the user object updates every login.
    public function afterUserChange(UserEvent $event)
    {
        $user = $event->getUser();
//	$logger = $this->get('logger');
//      $logger->info("updated user");

        // Get current invites and validate them.
        $currentInvites = $this->sm->findInvitationsForUser($user);

        // Get all shares for this user.
        $allowedShares = $this->sm->findEligibleSharesByUser($user);

        // Remove all invalidated invites
        foreach ($currentInvites as $i) {
            if (array_key_exists($i->getShare()->getId(), $allowedShares)) {
                unset($allowedShares[$i->getShare()->getId()]);
            } else {
                // User has no longer access, remove his invite.
                $this->sm->removeInvitation($invite);
            }
        }

        // Create new invites for remaining shares.
        foreach ($allowedShares as $share) {
            // XXX: Do we need an owner property or can we always use the share's owner?
            $this->sm->createInvitation($share, $share->getOwner(), $user);
        }
    }

    /**
     * @see Symfony\Component\EventDispatcher\EventSubscriberInterface::getSubscribedEvents();
     */
    public static function getSubscribedEvents()
    {
        return array(
            Events::USER_POST_PERSIST => 'afterUserChange',
            Events::USER_POST_UPDATE  => 'afterUserChange',
        );
    }
}
