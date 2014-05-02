<?php

namespace Libbit\LoxBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class KeyController extends Controller
{

    // -- API Methods ----------------------------------------------------------

    /**
     * @Route("/lox_api/key/{path}", name="libbit_lox_set_key_path", requirements={"path" = ".+"})
     * @Method({"POST"})
     */
    public function setKeyPathAction($path)
    {
        $im      = $this->get('libbit_lox.item_manager');
        $request = $this->get('request');
        $data    = json_decode($request->getContent(), true);
        $user    = $this->get('security.context')->getToken()->getUser();
        $item    = null;

        if (!isset($data['key']) || !isset($data['iv'])) {
            return new Response('Missing or incomplete parameters', 500);
        }

        if (isset($data['user']) && is_numeric($data['user'])) {
            $user = $this->get('fos_user.util.user_manipulator')->findOneById($data['user']);
        }

        $item = $im->findItemByPath($user, $path);

        if ($item && $item->getIsDir() === true) {
            if ($im->addKeyToItem($item, $user, $data['key'], $data['iv'])) {
                return new JsonResponse($item->getId());
            } else {
                return new Response('Forbidden, wrong owner', 403);
            }
        } else {
            return new Response('Path not found', 404);
        }

        return new JsonResponse($item->getId());
    }

    /**
     * @Route("/lox_api/key/{path}", name="libbit_lox_get_key_path", requirements={"path" = ".+"})
     * @Method({"GET"})
     */
    public function getKeyPathAction($path)
    {
        // STUB...
    }
}
