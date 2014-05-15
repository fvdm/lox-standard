<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManager;
use Rednose\FrameworkBundle\Entity\User;
use Libbit\LoxBundle\Events;
use Libbit\LoxBundle\Event\InvitationEvent;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Security\Core\SecurityContext;

class ShareManager
{
    protected $dispatcher;

    protected $em;

    protected $repository;

    protected $securityContext;

    /**
     * Constructor.
     *
     * @param EventDispatcherInterface $dispatcher
     * @param EntityManager            $em
     * @param SecurityContext          $securityContext
     */
    public function __construct(EventDispatcherInterface $dispatcher, EntityManager $em, SecurityContext $securityContext)
    {
        $this->dispatcher      = $dispatcher;
        $this->em              = $em;
        $this->repository      = $em->getRepository('Libbit\LoxBundle\Entity\Share');
        $this->securityContext = $securityContext;
    }

    public function createShare(Item $item, array $groups = array(), array $users = array())
    {
        // Don't create double shares.
        $share = $this->repository->findOneByItem($item);

        if ($share === null) {
            $share = new Share;
        }

        $share->setUsers(new ArrayCollection($users));
        $share->setGroups(new ArrayCollection($groups));

        $share->setItem($item);

        $share->setOwner($item->getOwner());

        if ($this->saveShare($share)) {
            return $share;
        }

        return false;
    }

    public function saveShare(Share $share)
    {
        // Security check
        if ($this->securityContext->getToken()->getUser()->getId() !== $share->getOwner()->getId()) {
            return false;
        }

        // If this is an existing share, first retrieve the current users.
        $this->em->persist($share);
        $this->em->flush();

        // TODO: Use events (this could be asynchronous).
        $this->synchronizeInvites($share);

        return true;
    }

    public function removeShare(Share $share)
    {
        // Security check
        if ($this->securityContext->getToken()->getUser()->getId() !== $share->getOwner()->getId()) {
            return false;
        }

        // XXX: Should we cascade this on database level?

        // Remove all pointers to the share.
        $pointers = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findBy(array(
            'shareOf' => $share->getItem(),
        ));

        foreach ($pointers as $pointer) {
            $this->em->remove($pointer);
        }

        // Remove the share itself.
        $this->em->remove($share);
        $this->em->flush();

        return true;
    }

    public function synchronizeInvites(Share $share)
    {
        // Build a unique list of new users to be invited, based on both Group and User models.
        $newUsers = array();

        foreach ($share->getGroups() as $group) {
            foreach ($group->getUsers() as $user) {
                $newUsers[$user->getId()] = $user;
            }
        }

        foreach ($share->getUsers() as $user) {
            $newUsers[$user->getId()] = $user;
        }

        // Current users
        $currentInvites = $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findByShare($share);

        foreach ($currentInvites as $invite) {
            $user = $invite->getReceiver();

            // If the newUsers contains an entry with an existing invite, remove it from the newUsers array.
            if (array_key_exists($user->getId(), $newUsers)) {
                unset($newUsers[$user->getId()]);
            } else {
                // User has no longer access, remove his invite.
                $this->removeInvitation($invite);
            }
        }

        // Invite all new users.
        foreach ($newUsers as $user) {
            // XXX: Do we need an owner property or can we always use the share's owner?
            $this->createInvitation($share, $share->getOwner(), $user);
        }
    }

    public function removeInvitation(Invitation $invite)
    {
        $share = $invite->getShare();

        $this->em->remove($invite);

        // Remove the user's personal share pointer item.
        $pointer = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneBy(array(
            'shareOf' => $share->getItem(),
            'owner'   => $invite->getReceiver(),
        ));

        if ($pointer !== null) {
            $this->em->remove($pointer);
        }

        // TODO: Optimize.
        $this->em->flush();
    }

    public function findShareBy(array $criteria)
    {
        return $this->repository->findOneBy($criteria);
    }

    public function findSharesBy(array $criteria)
    {
        return $this->repository->findBy($criteria);
    }

    public function findShareByItem(User $user, Item $item)
    {
        return $this->repository->findOneBy(array(
            'owner' => $user,
            'item'  => $item,
        ));
    }

    /*
     * Return all shares the user is allow to access, base on this identity
     * and the groups he's currently in.
     */
    public function findEligibleSharesByUser(User $user)
    {
        // FIXME: Optimize with query!
        $shares = $this->repository->findAll();

        $eligibleShares = array();

        foreach ($shares as $share) {
            $eligible = false;

            foreach ($share->getUsers() as $u) {
                if ($user === $u) {
                    $eligibleShares[$share->getId()] = $share;

                    $eligible = true;

                    continue;
                }
            }

            if ($eligible === true) {
                continue;
            }

            foreach ($share->getGroups() as $g) {
                foreach ($user->getGroups() as $ug) {
                    if ($ug === $g) {
                        $eligibleShares[$share->getId()] = $share;

                        continue;
                    }
                }
            }
        }

        return $eligibleShares;
    }

    public function findSharesByUser(User $user)
    {
        return $this->repository->findBy(array('owner' => $user));
    }

    public function findInvitationById($id)
    {
        return $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findOneById($id);
    }

    /**
     * Returns an invitation for a given source share and a given user.
     *
     * @param User $user
     * @param Item $item
     *
     * @return Invitation
     *
     * @throws \InvalidArgumentException
     */
    public function findInvitationByItem(User $user, Item $item)
    {
        // Item should be a source share and not a pointer.
        if ($item->hasShareOf()) {
            throw new \InvalidArgumentException();
        }

        $pointer = $item->getShareForUser($user);

        if (!$pointer) {
            throw new \InvalidArgumentException();
        }

        // Get the invite by specifying the item: This is the shared folder pointer and not the folder itself.
        return $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findOneBy(array(
            'receiver' => $user,
            'item'     => $pointer,
        ));
    }

    public function findInvitationsForUser(User $user)
    {
        // TODO: Improve sorting performance with query.
        $results = $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findBy(
            array('receiver' => $user, 'state' => Invitation::STATE_PENDING),
            array('createdAt' => 'DESC')
        );

        $results = array_merge($results, $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findBy(
            array('receiver' => $user, 'state' => Invitation::STATE_ACCEPTED),
            array('createdAt' => 'DESC')
        ));

        return array_merge($results, $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findBy(
            array('receiver' => $user, 'state' => Invitation::STATE_REVOKED),
            array('createdAt' => 'DESC')
        ));
    }

    // TODO: Validate
    public function acceptInvitation($invite)
    {
        $invite->setState(Invitation::STATE_ACCEPTED);

        $this->em->persist($invite);
        $this->em->flush();

        $event = new InvitationEvent($invite);
        $this->dispatcher->dispatch(Events::INVITATION_ACCEPTED, $event);
    }

    // TODO: Validate
    public function revokeInvitation($invite)
    {
        $invite->setState(Invitation::STATE_REVOKED);

        $this->em->persist($invite);
        $this->em->flush();

        $event = new InvitationEvent($invite);
        $this->dispatcher->dispatch(Events::INVITATION_REVOKED, $event);
    }

    // TODO: Abstract
    public function getPendingCountForUser(User $user)
    {
        $pending = $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findBy(array(
            'receiver' => $user,
            'state'    => Invitation::STATE_PENDING,
        ));

        return count($pending);
    }

    // TODO: Validate
    public function createInvitation($share, $sender, $receiver)
    {
        $invite = $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findOneBy(array(
            'receiver' => $receiver,
            'share'    => $share,
        ));

        // Don't send double invites.
        if ($invite !== null) {
            return;
        }

        // Don't send invites to the sender.
        if ($receiver->isEqualTo($sender)) {
            return;
        }

        $invite = new Invitation;

        $invite->setShare($share);
        $invite->setSender($sender);
        $invite->setReceiver($receiver);

        $this->em->persist($invite);
        $this->em->flush();

        $event = new InvitationEvent($invite);
        $this->dispatcher->dispatch(Events::INVITATION_SEND, $event);

        // TODO: Optimize.
        $this->em->flush();
    }
}
