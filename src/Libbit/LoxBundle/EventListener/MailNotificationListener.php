<?php

namespace Libbit\LoxBundle\EventListener;

use Libbit\LoxBundle\Entity\Revision;
use Libbit\LoxBundle\Event\RevisionEvent;
use Libbit\LoxBundle\Events;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Swift_Mailer as Mailer;
use Symfony\Component\Security\Core\SecurityContext;
use Libbit\LoxBundle\Entity\ItemManager;
use Libbit\LoxBundle\Entity\Item;
use Rednose\FrameworkBundle\Entity\User;
use Symfony\Component\Routing\Router;

/**
 * Creates mail notifications for certain events.
 */
class MailNotificationListener implements EventSubscriberInterface
{
    /**
     * @var \Swift_Mailer
     */
    protected $mailer;

    /**
     * @var TranslatorInterface
     */
    protected $translator;

    /**
     * @var SecurityContext
     */
    protected $context;

    /**
     * @var ItemManager
     */
    protected $itemManager;

    /**
     * @var Router
     */
    protected $router;

    /**
     * Constructor.
     *
     * @param Mailer              $mailer
     * @param TranslatorInterface $translator
     * @param SecurityContext     $context
     * @param Router              $router
     * @param ItemManager         $itemManager
     */
    public function __construct(Mailer $mailer, TranslatorInterface $translator, SecurityContext $context, Router $router, ItemManager $itemManager)
    {
        $this->mailer      = $mailer;
        $this->translator  = $translator;
        $this->context     = $context;
        $this->itemManager = $itemManager;
        $this->router      = $router;
    }

    /**
     * If this change made within a shared folder, notify all involved users except the person that made the change.
     *
     * @param RevisionEvent $event Event containing the revision object.
     */
    public function afterRevisionPersist(RevisionEvent $event)
    {
        $item  = $event->getRevision()->getItem();
        $actor = $event->getRevision()->getUser();

        if ($this->itemManager->isOrIsInsideSharedFolder($item) === false) {
            return;
        }

        $shareOrigin = $this->getShareOrigin($item);

        /** @var User[] $users */
        $users = array($shareOrigin->getOwner());

        if ($shareOrigin->hasShares()) {
            foreach ($shareOrigin->getShares() as $shareTarget) {
                $users[] = $shareTarget->getOwner();
            }
        }

        foreach ($users as $user) {
            if ($user->isEqualTo($actor)) {
                continue;
            }

            $this->sendMail($user, $actor, $item);
        }
    }

    /**
     * @see Symfony\Component\EventDispatcher\EventSubscriberInterface::getSubscribedEvents();
     */
    public static function getSubscribedEvents()
    {
        return array(Events::REVISION_POST_PERSIST => 'afterRevisionPersist');
    }

    protected function sendMail(User $user, User $actor, Item $item)
    {
        $subjectTemplate = 'File %item% has been changed in one of your shared folders';
        $bodyTemplate    = '%actor% has changed the file "%item%", in the following folder: %path%.';

        $path = $this->itemManager->getPathForUser($user, $item->getParent(), true);

        $subject = $this->translator->trans($subjectTemplate, array(
            '%item%' => $item->getTitle(),
        ));

        $body = $this->translator->trans($bodyTemplate, array(
            '%actor%' => $actor->getBestname(),
            '%item%'  => $item->getTitle(),
            '%path%'  => $this->router->generate('libbit_lox_home_path', array('path' => $path), true),
        ));

         $message = \Swift_Message::newInstance()
             ->setSubject($subject)
             ->setTo($user->getEmail())
             ->setBody($body)
         ;

         $this->mailer->send($message);
    }

    /**
     * @param Item $item
     *
     * @return Item
     */
    protected function getShareOrigin(Item $item)
    {
        $parent = $item->getParent();

        if ($parent->isShared()) {
            return $parent;
        }

        if ($parent->isShare()) {
            return $parent->getShareOf();
        }

        if ($parent->hasParent()) {
            return $this->getShareOrigin($parent);
        }

        return null;
    }
}
