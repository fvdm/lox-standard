<?php

namespace Rednose\LoxBundle\Notification\Type;

class CreateLinkNotificationType extends ItemNotificationType
{
    public function getTemplate()
    {
        return 'You created a link to the file %item%';
    }

    public function getMessage()
    {
        $link = $this->object->getLink();
        $item = $link->getItem();

        $url = $this->router->generate('rednose_lox_links_path', array('path' => $link->getPublicId().'/'.$item->getTitle()), true);

        $body = $this->translator->trans($this->getTemplate(), array(
            '%item%' => $this->getTitleHtml($item->getTitle()),
        ));

        $footer = $this->getDateHtml($this->formatter->format($this->object->getCreatedAt()));

        return $this->getHtml($body, $footer, $url);
    }
}
