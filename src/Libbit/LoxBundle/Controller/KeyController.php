<?php

namespace Libbit\LoxBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class KeyController extends Controller
{

    // -- API Methods ----------------------------------------------------------

    /**
     * @Route("/lox_api/key/{path}", name="libbit_lox_set_key_path", requirements={"path" = ".+"})
     * @Method({"POST"})
     */
    public function setKeyPathAction($path)
    {
        $request = $this->get('request');
        $data = json_decode($request->getContent(), true);

        // STUB...
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
