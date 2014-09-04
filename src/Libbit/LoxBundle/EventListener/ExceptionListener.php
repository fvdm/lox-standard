<?php

namespace Libbit\LoxBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\ContainerAware;

class ExceptionListener extends ContainerAware implements EventSubscriberInterface
{
    protected $container;

    public function __construct(ContainerInterface $container)
    {
    	$this->container = $container;
    }

    /**
     * {@inheritdoc}
     */
    public function onKernelException(GetResponseForExceptionEvent $event)
    {
    	if ($this->container->getParameter('kernel.environment') === 'dev') {
    		return;
    	}

        if ($this->container->getParameter('kernel.environment') === 'test') {
            $exception = $event->getException();
            $message   = $exception->getMessage();

            $response = new Response($message);

            $event->setResponse($response);

            return;
        }

		$exception = $event->getException();
		// $code      = $exception->getStatusCode();
        $code      = 500;
		$message   = $exception->getMessage();

		$content = $this->container->get('templating')->render('LibbitLoxBundle:Exception:error.html.twig', array(
			'message' => $message,
			'code'    => $code,
		));

		$response = new Response($content, $code);

        $event->setResponse($response);
    }

    /**
     * {@inheritdoc}
     */
    static public function getSubscribedEvents()
    {
        return array('onKernelException');
    }
}