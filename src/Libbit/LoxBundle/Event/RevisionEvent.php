<?php

namespace Libbit\LoxBundle\Event;

use Libbit\LoxBundle\Entity\Revision;
use Symfony\Component\EventDispatcher\Event;

class RevisionEvent extends Event
{
    private $revision;

    public function __construct(Revision $revision)
    {
        $this->revision = $revision;
    }

    public function getRevision()
    {
        return $this->revision;
    }
}
