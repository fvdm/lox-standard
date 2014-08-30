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
        return $this->render('LibbitLoxBundle:Web:home.html.twig');
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

        return $this->render('LibbitLoxBundle:Web:sharing.html.twig', array(
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

        return $this->render('LibbitLoxBundle:Web:links.html.twig', array(
            'links' => $links,
        ));
    }

    /**
     * @Route("/settings", name="libbit_lox_settings")
     * @Method({"GET"})
     */
    public function settingsAction()
    {
        $em = $this->getDoctrine()->getManager();

        $user  = $this->getUser();
        $prefs = $em->getRepository('Libbit\LoxBundle\Entity\UserPreferences')->findOneBy(array('user' => $user));

        $email = $prefs && $prefs->getEmail();

        return $this->render('LibbitLoxBundle:Web:settings.html.twig', array(
            'user'  => $user,
            'email' => $email
        ));
    }

    /**
     * @Route("/register_app", name="libbit_lox_register_app")
     * @Method({"GET"})
     */
    public function registerAppAction()
    {
        // XXX: Sending API 'secret' keys is insecure but sadly enough requested by the customer.
        // we should consider a configuration parameter to disable this 'feature' on installations that do
        // use proper oAuth 2.0 supporting client apps.
        $clientManager = $this->get('fos_oauth_server.client_manager.default');
        $clients = $clientManager->findClientsBy(array());

        $em = $this->getDoctrine()->getManager();

        $settings = $em->getRepository('Libbit\LoxBundle\Entity\Settings')->findAll()[0];

        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');

        return $this->render(
            'LibbitLoxBundle:Web:register_app.json.twig',
            array(
                'clients' => $clients,
                'application_title' => $settings->getApplicationTitle(),
                'application_logo' => $settings->getApplicationLogo(),
                'app_fontcolor' => $settings->getAppFontcolor(),
                'app_backcolor' => $settings->getAppBackcolor(),
            ),
            $response
        );
    }
}
