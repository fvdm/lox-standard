<?php

namespace Libbit\LoxBundle\Event;

use Libbit\LoxBundle\Entity\Link;
use Symfony\Component\EventDispatcher\Event;

class LinkEvent extends Event
{
    private $link;

    public function __construct(Link $link)
    {
        $this->link = $link;
    }

    public function getLink()
    {
        return $this->link;
    }
}
