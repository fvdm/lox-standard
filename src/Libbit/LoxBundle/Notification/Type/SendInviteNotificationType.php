<?php

namespace Libbit\LoxBundle\Notification\Type;

class SendInviteNotificationType extends ItemNotificationType
{
    public function getTemplate()
    {
        return 'You invited %user% to join the folder %item%';
    }

    public function getMessage()
    {
        $item = $this->object->getItem();

        $url = $this->router->generate('libbit_lox_home_path', array('path' => $this->im->getPathForUser($this->user, $item, true)), true);

        $body = $this->translator->trans($this->getTemplate(), array(
            '%user%' => $this->object->getUser()->getBestName(),
            '%item%' => $this->getTitleHtml($item->getTitle()),
        ));

        $footer = $this->getDateHtml($this->formatter->format($this->object->getCreatedAt()));

        return $this->getHtml($body, $footer, $url);
    }
}
