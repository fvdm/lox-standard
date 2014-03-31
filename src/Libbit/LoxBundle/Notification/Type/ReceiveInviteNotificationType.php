<?php

namespace Libbit\LoxBundle\Notification\Type;

class ReceiveInviteNotificationType extends ItemNotificationType
{
    public function getTemplate()
    {
        return '%user% invited you to the folder %item%';
    }

    public function getMessage()
    {
        $item = $this->object->getItem();

        $url = $this->router->generate('libbit_lox_sharing', array(), true);

        $body = $this->translator->trans($this->getTemplate(), array(
            '%user%' => $this->object->getUser()->getBestName(),
            '%item%' => $this->getTitleHtml($item->getTitle()),
        ));

        $footer = $this->getDateHtml($this->formatter->format($this->object->getCreatedAt()));

        return $this->getHtml($body, $footer, $url);
    }
}
