<?php

namespace Libbit\LoxBundle\EventListener;

use Rednose\FrameworkBundle\Events;
use Libbit\LoxBundle\Entity\ItemManager;
use Rednose\FrameworkBundle\Event\UserEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Creates a root item for a new user.
 */
class ItemRootListener implements EventSubscriberInterface
{
    protected $im;

    /**
     * Constructor
     *
     * @param ItemManager $im A concrete item manager
     */
    public function __construct(ItemManager $im)
    {
        $this->im = $im;
    }

    /**
     * Creates a root item for the added user.
     *
     * @param UserEvent $event Event containing the user object.
     */
    public function afterUserPersist(UserEvent $event)
    {
        $user = $event->getUser();
        $item = $this->im->createRootItem($user);

        $this->im->saveItem($item);
    }

    /**
     * @see Symfony\Component\EventDispatcher\EventSubscriberInterface::getSubscribedEvents();
     */
    public static function getSubscribedEvents()
    {
        return array(Events::USER_POST_PERSIST => 'afterUserPersist');
    }
}
