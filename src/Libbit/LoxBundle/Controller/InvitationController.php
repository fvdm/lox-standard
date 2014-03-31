<?php

namespace Libbit\LoxBundle\Controller;

use Libbit\LoxBundle\Entity\Invitation;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use FOS\RestBundle\Util\Codes;

class InvitationController extends Controller
{
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
}
