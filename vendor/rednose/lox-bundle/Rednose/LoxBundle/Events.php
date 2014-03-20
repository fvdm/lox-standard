<?php

namespace Rednose\LoxBundle;

final class Events
{
    /**
     * This event occurs after an invitation has been send to an individual user.
     * The listener receives a Rednose\LoxBundle\Event\InvitationEvent instance.
     */
     const INVITATION_SEND = 'rednose_lox.invitation.send';

    /**
     * This event occurs after an invitation has been accepted by an individual user.
     * The listener receives a Rednose\LoxBundle\Event\InvitationEvent instance.
     */
     const INVITATION_ACCEPTED = 'rednose_lox.invitation.accepted';

    /**
     * This event occurs after an invitation has been revoked by an individual user.
     * The listener receives a Rednose\LoxBundle\Event\InvitationEvent instance.
     */
     const INVITATION_REVOKED = 'rednose_lox.invitation.revoked';

    /**
     * This event occurs after a user created a public link.
     * The listener receives a Rednose\LoxBundle\Event\LinkEvent instance.
     */
     const LINK_CREATED = 'rednose_lox.link.created';
 }
