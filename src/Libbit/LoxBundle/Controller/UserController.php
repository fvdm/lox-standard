<?php

namespace Libbit\LoxBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;

class UserController extends Controller
{
    // -- API Methods ----------------------------------------------------------

    /**
     * Returns info about the user.
     *
     * @Route("/lox_api/user", name="libbit_lox_api_get_user")
     * @Method({"GET"})
     *
     * @ApiDoc(
     *     section="User"
     * )
     */
    public function getUserAction()
    {
        $user = $this->get('security.context')->getToken()->getUser();

        $data = array(
            'name' => $user->getBestName(),
        );

        return new JsonResponse($data);
    }

    /**
     * Returns users and groups
     *
     * @Route("/lox_api/idenities/{query}", defaults={"query"=""}, name="libbit_lox_api_identities")
     *
     * @param $query Optional query string to find users and groups
     *
     * @Method({"GET"})
     *
     * @ApiDoc(
     *     section="User"
     * )
     */
    public function getIdentitiesAction($query)
    {
        if ($query) {
            $request = $this->get('request');
            $request->query->set('q', $query);
        }

        $identManager = $this->get('libbit_lox.identity_manager');

        return new JsonResponse(
            $identManager->getIdentities()
        );
    }
}
