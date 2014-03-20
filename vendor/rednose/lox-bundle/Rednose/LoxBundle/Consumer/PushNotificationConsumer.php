<?php

namespace Rednose\LoxBundle\Consumer;

use Sonata\NotificationBundle\Consumer\ConsumerInterface;
use Sonata\NotificationBundle\Consumer\ConsumerEvent;
use Sonata\NotificationBundle\Model\MessageInterface;
use Symfony\Component\HttpKernel\Log\LoggerInterface;
use Sonata\NotificationBundle\Exception\InvalidParameterException;
use RMS\PushNotificationsBundle\Service\Notifications;
use RMS\PushNotificationsBundle\Message\iOSMessage;
use Rednose\LoxBundle\Entity\Notification;

class PushNotificationConsumer implements ConsumerInterface
{
    protected $logger;

    protected $notifications;

    protected $types = array(
        'invite',
    );

    public function __construct(LoggerInterface $logger, Notifications $notifications)
    {
        $this->logger        = $logger;
        $this->notifications = $notifications;
    }

    /**
     * {@inheritdoc}
     */
    public function process(ConsumerEvent $event)
    {
        $message = $event->getMessage();

        $this->logger->debug('Sending iOS push notifications');

        if (!in_array($message->getValue('type'), $this->types)) {
            throw new InvalidParameterException();
        }

        foreach ($message->getValue('devices') as $token => $badge) {
            $pushMessage = new iOSMessage;

            $pushMessage->setMessage($message->getValue('message'));
            $pushMessage->setDeviceIdentifier($token);

            $pushMessage->setAPSSound('default');
            $pushMessage->setAPSBadge($badge);

            $pushMessage->setData(array('type' => $message->getValue('type')));

            $this->notifications->send($pushMessage);
        }
    }
}
