<?php

namespace Libbit\LoxBundle\EventListener;

use Doctrine\ORM\EntityManager;
use Libbit\LoxBundle\Entity\Invitation;
use Libbit\LoxBundle\Entity\Notification;
use Libbit\LoxBundle\Events;
use Libbit\LoxBundle\Event\LinkEvent;
use Libbit\LoxBundle\Event\InvitationEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Symfony\Component\Translation\TranslatorInterface;
use RMS\PushNotificationsBundle\Service\Notifications;
use RMS\PushNotificationsBundle\Message\iOSMessage;

/**
 * Creates mail notifications for certain events.
 */
class MailNotificationListener implements EventSubscriberInterface
{
    protected $mailer;

    public function __construct($mailer)
    {
        $this->mailer = $mailer;
    }

    public function afterInvitationSend(InvitationEvent $event)
    {
        // $invite = $event->getInvitation();

        // $email = $invite->getReceiver()->getEmail();

        // TODO: Check if user has email.
        // $message = \Swift_Message::newInstance()
        //     ->setSubject('Hello Email')
        //     ->setFrom('send@example.com')
        //     ->setTo($email)
        //     ->setBody('Test!')
        // ;

        // $this->mailer->send($message);
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
}