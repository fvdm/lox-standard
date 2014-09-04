<?php

namespace Libbit\LoxBundle;

final class Events
{
    /**
     * This event occurs after an invitation has been send to an individual user.
     * The listener receives a Libbit\LoxBundle\Event\InvitationEvent instance.
     */
     const INVITATION_SEND = 'libbit_lox.invitation.send';

    /**
     * This event occurs after an invitation has been accepted by an individual user.
     * The listener receives a Libbit\LoxBundle\Event\InvitationEvent instance.
     */
     const INVITATION_ACCEPTED = 'libbit_lox.invitation.accepted';

    /**
     * This event occurs after an invitation has been revoked by an individual user.
     * The listener receives a Libbit\LoxBundle\Event\InvitationEvent instance.
     */
     const INVITATION_REVOKED = 'libbit_lox.invitation.revoked';

    /**
     * This event occurs after a user created a public link.
     * The listener receives a Libbit\LoxBundle\Event\LinkEvent instance.
     */
     const LINK_CREATED = 'libbit_lox.link.created';

    /**
     * This event occurs after a new revision has been persisted to the backend.
     * The listener receives a Libbit\LoxBundle\Event\RevisionEvent instance.
     */
    const REVISION_POST_PERSIST = 'libbit_lox.revision.post_persist';
}
