<?php

namespace Libbit\LoxBundle\Controller;

namespace Libbit\LoxBundle\Entity\ItemKey;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class KeyController extends Controller
{

    // -- API Methods ----------------------------------------------------------

    /**
     * @Route("/lox_api/key/{path}", name="libbit_lox_set_key_path", requirements={"path" = ".+"})
     * @Method({"POST"})
     */
    public function setKeyPathAction($path)
    {
        // TODO: Create key manager

        $request = $this->get('request');

        $data = json_decode($request->getContent(), true);

        return new JsonResponse(array());
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
