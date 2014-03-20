<?php

namespace Rednose\LoxBundle\EventListener;

use JMS\Serializer\Handler\SubscribingHandlerInterface;
use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\PreSerializeEvent;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\GraphNavigator;
use JMS\Serializer\JsonSerializationVisitor;
use Rednose\FrameworkBundle\DateTimeFormatter\DateTimeFormatter;
use Rednose\LoxBundle\Entity\ItemManager;
use Symfony\Component\HttpKernel\Event\PostResponseEvent;
use Symfony\Component\Security\Core\SecurityContext;

/**
 * Adds data after serialization.
 */
class ItemSerializeListener implements EventSubscriberInterface
{
    protected $im;

    protected $context;

    protected $formatter;

    /**
     * Constructor
     *
     * @param ItemManager       $im        A concrete item manager
     * @param SecurityContext   $context   Security context to retreive the user object
     * @param DateTimeFormatter $formatter DateTime formatter
     */
    public function __construct(ItemManager $im, SecurityContext $context, DateTimeFormatter $formatter)
    {
        $this->im        = $im;
        $this->context   = $context;
        $this->formatter = $formatter;
    }

    /**
     * {@inheritdoc}
     */
    static public function getSubscribedEvents()
    {
        return array(
            array('event' => 'serializer.post_serialize', 'class' => 'Rednose\LoxBundle\Entity\Item', 'method' => 'onPostSerialize'),
            array('event' => 'serializer.pre_serialize', 'class' => 'Rednose\LoxBundle\Entity\Item', 'method' => 'onPreSerialize'),
        );
    }

    public function onPreSerialize(PreSerializeEvent $event)
    {
        $item   = $event->getObject();
        $groups = $event->getContext()->attributes->get('groups');

        if ($groups->isDefined() && in_array('api', $groups->get())) {
            $depth = $event->getContext()->getDepth();

            // Set empty children to null instead of an empty array, so the property isn't serialized.
            if ($depth > 1) {
                if ($item->hasShareOf() === true) {
                    $item->getShareOf()->setChildren(null);
                } else {
                    $item->setChildren(null);
                }
            }
        }
    }

    public function onPostSerialize(ObjectEvent $event)
    {
        $user   = $this->context->getToken()->getUser();
        $item   = $event->getObject();
        $groups = $event->getContext()->attributes->get('groups');
        $depth  = $event->getContext()->getDepth();

        // Add the file path.
        $event->getVisitor()->addData('path', $this->im->getPathForUser($user, $item));

        // Add formatted date for web client.
        if ($groups->isDefined() && in_array('web', $groups->get())) {
            $event->getVisitor()->addData('date_formatted', $this->formatter->format($item->getModifiedAt()));
        }

        // Add a folder hash for API calls.
        if ($groups->isDefined() && in_array('api', $groups->get()) && $item->getIsDir() === true && $depth === 0) {
            $event->getVisitor()->addData('hash', $this->im->getHash($item));
        }

        // Add icon type
        $event->getVisitor()->addData('icon', $this->getIcon($item));
    }

    // TODO: Refactor
    protected function getIcon($item)
    {
        if ($item->getIsDir() === true) {
            return $item->isShare() || $item->isShared() ? 'folder-shared' : 'folder';
        }

        $baseDir = __DIR__.'/../Resources/public/icons/files/16px';

        if (file_exists($baseDir.'/'.$item->getFileExtension().'.png')) {
            return $item->getFileExtension();
        }

        return '_blank';
    }
}
