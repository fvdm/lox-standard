<?php

namespace Rednose\LoxBundle\Event;

use Rednose\LoxBundle\Entity\Invitation;
use Symfony\Component\EventDispatcher\Event;

class InvitationEvent extends Event
{
    private $invitation;

    public function __construct(Invitation $invitation)
    {
        $this->invitation = $invitation;
    }

    public function getInvitation()
    {
        return $this->invitation;
    }
}
