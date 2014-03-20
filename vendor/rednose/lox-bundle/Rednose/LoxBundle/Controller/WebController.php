<?php

namespace Rednose\LoxBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

class WebController extends Controller
{
    /**
     * @Route("/", name="rednose_lox_index")
     * @Method({"GET"})
     */
    public function indexAction()
    {
        return $this->redirect($this->generateUrl('rednose_lox_home'));
    }

    /**
     * @Route("/home/", name="rednose_lox_home")
     * @Route("/home/{path}", name="rednose_lox_home_path", requirements={"path" = ".+"})
     * @Method({"GET"})
     */
    public function homeAction()
    {
        return $this->render('RednoseLoxBundle:Web:home.html.twig');
    }

    /**
     * @Route("/sharing", name="rednose_lox_sharing")
     * @Method({"GET"})
     */
    public function sharingAction()
    {
        $sm   = $this->get('rednose_lox.share_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $shares      = $sm->findSharesByUser($user);
        $invitations = $sm->findInvitationsForUser($user);

        return $this->render('RednoseLoxBundle:Web:sharing.html.twig', array(
            'shares'  => $shares,
            'invites' => $invitations,
        ));
    }

    /**
     * @Route("/links", name="rednose_lox_links")
     * @Method({"GET"})
     */
    public function linksAction()
    {
        $lm   = $this->get('rednose_lox.link_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $links = $lm->findAllByUser($user);

        return $this->render('RednoseLoxBundle:Web:links.html.twig', array(
            'links' => $links,
        ));
    }
}
