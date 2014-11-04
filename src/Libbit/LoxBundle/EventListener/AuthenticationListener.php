<?php

namespace Libbit\LoxBundle\EventListener;

use Symfony\Bridge\Monolog\Logger;
use Symfony\Component\DependencyInjection\ContainerAware;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\EventDispatcher\ContainerAwareEventDispatcher;
use Symfony\Component\Security\Core\Event\AuthenticationFailureEvent;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;


class AuthenticationListener
{
    public function __construct(Logger $container)
    {
        $this->logger = $container;
    }
    
    public static function getSubscribedEvents()
    {
        return array(
            AuthenticationEvents::AUTHENTICATION_FAILURE => 'onAuthenticationFailure',
            AuthenticationEvents::AUTHENTICATION_SUCCESS => 'onAuthenticationSuccess'
        );
    }
    public function onAuthenticationFailure(AuthenticationFailureEvent $event)
    {
        $token    = $event->getAuthenticationToken();
        $username = $token->getUsername();
        $this->logger->info("This is an authentication error for user \"" . $username . "\"");
    }
    
    public function onAuthenticationSuccess(InteractiveLoginEvent $event)
    {
        $token    = $event->getAuthenticationToken();
        $username = $token->getUsername();
        $this->logger->info("User \"" . $username . "\" has successfully logged in");
    }
}
?> 
