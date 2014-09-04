<?php

namespace Libbit\LoxBundle\EventListener;

use Doctrine\ORM\EntityManager;
use Libbit\LoxBundle\Entity\Invitation;
use Libbit\LoxBundle\Events;
use Libbit\LoxBundle\Event\LinkEvent;
use Libbit\LoxBundle\Event\InvitationEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Sonata\NotificationBundle\Backend\BackendInterface;

/**
 * Creates push notifications for certain events.
 */
class PushNotificationListener implements EventSubscriberInterface
{
    protected $em;

    protected $context;

    protected $backend;

    protected $translator;

    public function __construct(EntityManager $em, SecurityContextInterface $context, BackendInterface $backend, TranslatorInterface $translator)
    {
        $this->em            = $em;
        $this->context       = $context;
        $this->backend = $backend;
        $this->translator    = $translator;
    }

    public function afterInvitationSend(InvitationEvent $event)
    {
        $invite = $event->getInvitation();

        $devices = $this->em->getRepository('Rednose\FrameworkBundle\Entity\Device')->findByUser($invite->getReceiver());

        if (empty($devices) === false) {
            $template = '%user% invited you to the folder \'%item%\'';

            $body = $this->translator->trans($template, array(
                '%user%' => $invite->getSender()->getBestName(),
                '%item%' => $invite->getShare()->getItem()->getTitle(),
            ));

            $messages = array();

            foreach ($devices as $device) {
                $messages[$device->getToken()] = $this->getBadgeCount($invite->getReceiver());
            }

            $this->backend->createAndPublish('libbit_lox_push_notification', array(
                'devices' => $messages,
                'message' => $body,
                'type'    => 'invite',
            ));
        }
    }

    /**
     * @see Symfony\Component\EventDispatcher\EventSubscriberInterface::getSubscribedEvents();
     */
    public static function getSubscribedEvents()
    {
        return array(
            Events::INVITATION_SEND => 'afterInvitationSend',
        );
    }

    protected function getBadgeCount($user)
    {
        $pending = $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findBy(array(
            'receiver' => $user,
            'state'    => Invitation::STATE_PENDING,
        ));

        return count($pending);
    }
}
