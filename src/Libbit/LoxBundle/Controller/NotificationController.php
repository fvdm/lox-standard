<?php

namespace Libbit\LoxBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;

class NotificationController extends Controller
{
    // -- Web Methods ----------------------------------------------------------

    /**
     * Get all notifications for the current user.
     *
     * @Route("/notifications", name="libbit_lox_get_notifications")
     * @Method({"GET"})
     */
    public function getNotificationsAction()
    {
        $em   = $this->get('doctrine.orm.entity_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $notifications = $em->getRepository('Libbit\LoxBundle\Entity\Notification')->findBy(
            array('owner' => $user),
            // Sort by ID, this gives us finer precission then createdAt, which has a resolution of a second.
            array('id' => 'DESC'),
            // Limit to the last 25 notifications for now.
            25
        );

        $items = array();

        foreach ($notifications as $n) {
            $items[] = $this->serialize($n);
        }

        return new JsonResponse($items);
    }

    /**
     * Mark all notifications as read for the current user.
     *
     * @Route("/notifications/mark_read", name="libbit_lox_post_notifications_mark_read")
     * @Method({"POST"})
     */
    public function postNotificationsMarkReadAction()
    {
        $em   = $this->get('doctrine.orm.entity_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $notifications = $em->getRepository('Libbit\LoxBundle\Entity\Notification')->findBy(array('owner' => $user));

        foreach ($notifications as $n) {
            $n->setRead();
            $em->persist($n);
        }

        $em->flush();

        return new Response();
    }

    /**
     * Get unread messages count for the current user.
     *
     * @Route("/notifications/unread", name="libbit_lox_get_notifications_unread")
     * @Method({"GET"})
     */
    public function getNotificationsUnread()
    {
        // If this isn't an XMLHTTP request, redirect the user to the home screen.
        if ($this->get('request')->isXmlHttpRequest() === false) {
            return $this->redirect($this->generateUrl('libbit_lox_home'));
        }

        $em   = $this->get('doctrine.orm.entity_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $notifications = $em->getRepository('Libbit\LoxBundle\Entity\Notification')->findBy(array(
            'owner'  => $user,
            'status' => 0,
        ));

        return new Response(count($notifications));
    }

    protected function serialize($notification)
    {
        return array(
            'read' => $notification->isRead(),
            'html' => $this->getHtml($notification),
        );
    }

    protected function getHtml($notification)
    {
        $factory = $this->get('rednose_framework.notification.factory');

        return $factory->get($notification)->getMessage();
    }
}