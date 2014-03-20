<?php

namespace Rednose\LoxBundle\Event;

use Rednose\LoxBundle\Entity\Link;
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
