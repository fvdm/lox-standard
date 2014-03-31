<?php

namespace Libbit\LoxBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

class WebController extends Controller
{
    /**
     * @Route("/", name="libbit_lox_index")
     * @Method({"GET"})
     */
    public function indexAction()
    {
        return $this->redirect($this->generateUrl('libbit_lox_home'));
    }

    /**
     * @Route("/home/", name="libbit_lox_home")
     * @Route("/home/{path}", name="libbit_lox_home_path", requirements={"path" = ".+"})
     * @Method({"GET"})
     */
    public function homeAction()
    {
        return $this->render('RednoseLoxBundle:Web:home.html.twig');
    }

    /**
     * @Route("/sharing", name="libbit_lox_sharing")
     * @Method({"GET"})
     */
    public function sharingAction()
    {
        $sm   = $this->get('libbit_lox.share_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $shares      = $sm->findSharesByUser($user);
        $invitations = $sm->findInvitationsForUser($user);

        return $this->render('RednoseLoxBundle:Web:sharing.html.twig', array(
            'shares'  => $shares,
            'invites' => $invitations,
        ));
    }

    /**
     * @Route("/links", name="libbit_lox_links")
     * @Method({"GET"})
     */
    public function linksAction()
    {
        $lm   = $this->get('libbit_lox.link_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $links = $lm->findAllByUser($user);

        return $this->render('RednoseLoxBundle:Web:links.html.twig', array(
            'links' => $links,
        ));
    }
}
