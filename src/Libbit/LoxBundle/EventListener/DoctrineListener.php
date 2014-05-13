<?php

namespace Libbit\LoxBundle\EventListener;

use Doctrine\ORM\Event\LifecycleEventArgs;
use Libbit\LoxBundle\Entity\Revision;
use Libbit\LoxBundle\Event\RevisionEvent;
use Libbit\LoxBundle\Events;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

/**
 * Fires events for the Revision entity.
 */
class DoctrineListener
{
    protected $dispatcher;

    /**
     * Constructor.
     *
     * @param EventDispatcherInterface $dispatcher Fires the events.
     */
    public function __construct(EventDispatcherInterface $dispatcher)
    {
        $this->dispatcher = $dispatcher;
    }

    public function postPersist(LifecycleEventArgs $args)
    {
        $entity = $args->getEntity();

        if ($entity instanceof Revision) {
            $event = new RevisionEvent($entity);

            $this->dispatcher->dispatch(Events::REVISION_POST_PERSIST, $event);
        }
    }
}
