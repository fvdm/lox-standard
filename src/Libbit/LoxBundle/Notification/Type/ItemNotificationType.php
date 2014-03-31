<?php

namespace Libbit\LoxBundle\Notification\Type;

use Rednose\FrameworkBundle\Model\NotificationInterface;
use Rednose\FrameworkBundle\Notification\AbstractNotificationType;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ItemNotificationType extends AbstractNotificationType
{
    protected $im;

    protected $translator;

    protected $user;

    protected $router;

    protected $formatter;

    public function __construct(NotificationInterface $object, ContainerInterface $container)
    {
        parent::__construct($object, $container);

        $this->im         = $container->get('libbit_lox.item_manager');
        $this->translator = $container->get('translator');
        $this->user       = $container->get('security.context')->getToken()->getUser();
        $this->router     = $container->get('router');
        $this->formatter  = $container->get('rednose_framework.datetime_formatter');
    }

    public function getTemplate()
    {
        return '';
    }

    protected function getTitleHtml($title)
    {
        return strtr('<strong>%TITLE%</strong>', array('%TITLE%' => $title));
    }

    protected function getDateHtml($date)
    {
        return strtr('<small class="muted">%DATE%</small>', array('%DATE%' => $date));
    }

    protected function getHtml($body, $footer, $url = null)
    {
        $content =  strtr('<div>%BODY%</div><div>%FOOTER%</div>', array(
            '%BODY%'   => $body,
            '%FOOTER%' => $footer,
        ));

        if ($url === null) {
            return $content;
        }

        return strtr('<a href="%URL%">%CONTENT%</a>', array(
            '%URL%'     => $url,
            '%CONTENT%' => $content,
        ));
    }
}
