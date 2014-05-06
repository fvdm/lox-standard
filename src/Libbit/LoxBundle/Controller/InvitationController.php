<?php

namespace Libbit\LoxBundle\Controller;

use Libbit\LoxBundle\Entity\Invitation;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use JMS\Serializer\SerializationContext;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Util\Codes;

class InvitationController extends Controller
{
    // -- Web Methods ----------------------------------------------------------

    /**
     * @Route("/invite/{id}/accept", name="libbit_lox_invitation_accept")
     * @Method({"GET"})
     */
    public function acceptAction($id)
    {
        $sm   = $this->get('libbit_lox.share_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $invite = $sm->findInvitationById($id);

        $response = new Response;

        if ($invite === null) {
            $response->setStatusCode(Codes::HTTP_NOT_FOUND);

            return $response;
        }

        if ($invite->getReceiver()->isEqualTo($user) === false) {
            $response->setStatusCode(Codes::HTTP_FORBIDDEN);

            return $response;
        }

        if ($invite->getState() !== Invitation::STATE_ACCEPTED) {
            $sm->acceptInvitation($invite);
        }

        return $this->redirect($this->generateUrl('libbit_lox_sharing'));
    }

    /**
     * @Route("/invite/{id}/revoke", name="libbit_lox_invitation_revoke")
     * @Method({"GET"})
     */
    public function revokeAction($id)
    {
        $sm   = $this->get('libbit_lox.share_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $invite = $sm->findInvitationById($id);

        $response = new Response;

        if ($invite === null) {
            $response->setStatusCode(Codes::HTTP_NOT_FOUND);

            return $response;
        }

        if ($invite->getReceiver()->isEqualTo($user) === false) {
            $response->setStatusCode(Codes::HTTP_FORBIDDEN);

            return $response;
        }

        if ($invite->getState() === Invitation::STATE_ACCEPTED) {
            $sm->revokeInvitation($invite);
        }

        return $this->redirect($this->generateUrl('libbit_lox_sharing'));
    }

    // -- API Methods ----------------------------------------------------------

    /**
     * Get invitations of the session user
     *
     * <p><strong>Example JSON response</strong></p>
     * <pre>[
     *    {
     *        "id":15,
     *        "created_at":"2014-05-06T14:34:48+0200",
     *        "state":"pending",
     *        "share":{
     *            "id":15,
     *            "item":{
     *                "is_dir":true,
     *                "title":"Folder 1",
     *                "modified_at":"2014-04-30T18:28:42+0200",
     *                "is_shared":true,
     *                "is_share":false,
     *                "path":"\/Folder 1",
     *                "icon":"folder-shared"
     *            },
     *            "identities":[
     *                {
     *                    "id":"user_38",
     *                    "title":"Administrator",
     *                    "type":"user"
     *                }
     *            ]
     *        }
     *    }, {
     *        "id":12,
     *        "created_at":"2014-04-30T18:28:42+0200",
     *        "state":"revoked",
     *        "share":{
     *            "id":12,
     *            "item":{
     *                "is_dir":true,
     *                "title":"Demo user's shared folder",
     *                "modified_at":"2014-04-30T18:28:42+0200",
     *                "is_shared":true,
     *                "is_share":false,
     *                "path":"\/Demo user's shared folder",
     *                "icon":"folder-shared"
     *            },
     *            "identities":[
     *                {
     *                    "id":"user_38",
     *                    "title":"Administrator",
     *                    "type":"user"
     *                }
     *            ]
     *        }
     *    }
     *]</pre>
     *
     * @Route("/lox_api/invitations", name="libbit_lox_api_invitations")
     * @Method({"GET"})
     *
     * @ApiDoc(
     *     section="Invitation",
     *
     *     statusCodes={
     *         200="Returned when successful."
     *     }
     * )
     */
    public function getInvitesAction()
    {
        $user = $this->get('security.context')->getToken()->getUser();
        $sm = $this->get('libbit_lox.share_manager');

        $invitations = $sm->findInvitationsForUser($user);

        $view = View::create();
        $handler = $this->get('fos_rest.view_handler');

        $context = new SerializationContext();
        $context->setGroups(array('details'));
        $view->setSerializationContext($context);

        $view->setData($invitations);
        $view->setFormat('json');

        return $handler->handle($view);
    }

    /**
     * Accept an invitation
     *
     * @Route("/lox_api/invite/{id}/accept", name="libbit_lox_api_invitation_accept")
     * @Method({"POST"})
     *
     * @ApiDoc(
     *     section="Invitation",
     *
     *     statusCodes={
     *         200="Returned when successful.",
     *         403="Returned when permission is denied.",
     *         404="Returned when invitation not found."
     *     }
     * )
     */
    public function acceptInviteAction($id)
    {
        $response = $this->acceptAction($id);

        return new Response('', $response->getStatusCode());
    }

    /**
     * Revoke an invitation
     *
     * @Route("/lox_api/invite/{id}/revoke", name="libbit_lox_api_invitation_revoke")
     * @Method({"POST"})
     *
     * @ApiDoc(
     *     section="Invitation",
     *
     *     statusCodes={
     *         200="Returned when successful.",
     *         403="Returned when permission is denied.",
     *         404="Returned when invitation not found."
     *     }
     * )
     */
    public function revokeInviteAction($id)
    {
        $response = $this->revokeAction($id);

        return new Response('', $response->getStatusCode());
    }
}
