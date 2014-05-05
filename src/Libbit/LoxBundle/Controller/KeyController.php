<?php

namespace Libbit\LoxBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;

class KeyController extends Controller
{

    // -- API Methods ----------------------------------------------------------

    /**
     * Add a key and initialization vector to a path for the session user or
     * a supplied user.
     *
     * The expected key is a RSA 256bit encrypted version of a EAS 2048 key using
     * the public key of the supplied user.
     *
     * <p><strong>Example JSON request</strong></p>
     * <pre>{
     *     "key" : "GYRBAC54vZVXjK...WvruVr/PX",
     *     "iv"  : "iBEgIJGRSiUCYR...GMgEOjEFg",
     *     "user": 2
     * }</pre>
     *
     *
     * @Route("/lox_api/key/{path}", name="libbit_lox_set_key_path", requirements={"path" = ".+"})
     * @Method({"POST"})
     *
     * @ApiDoc(
     *     section="Key",
     *     description="Add a key and initialization vector to a path for a session user or a supplied user.",
     *     statusCodes={
     *         200="Returned when successful.",
     *         403="Returned when the path is not owned by the session user.",
     *         404="Returned when the path is not found."
     *     }
     * )
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
            if ($im->addItemKey($item, $user, $data['key'], $data['iv'])) {
                return new JsonResponse($item->getId());
            } else {
                return new Response('Forbidden, wrong owner', 403);
            }
        } else {
            return new Response('Path not found', 404);
        }

        return new JsonResponse(array('id' => $item->getId()));
    }

    /**
     * Get a  a path's key and initialization vector for the session user.
     *
     * <p><strong>Example JSON response</strong></p>
     * <pre>{
     *     "key" : "GYRBAC54vZVXjK...WvruVr/PX",
     *     "iv"  : "iBEgIJGRSiUCYR...GMgEOjEFg"
     * }</pre>
     *
     *
     * @Route("/lox_api/key/{path}", name="libbit_lox_get_key_path", requirements={"path" = ".+"})
     * @Method({"GET"})
     *
     * @ApiDoc(
     *     section="Key",
     *     statusCodes={
     *         200="Returned when successful.",
     *         404="Returned when the path or key is not found.",
     *     }
     * )
     */
    public function getKeyPathAction($path)
    {
        $im   = $this->get('libbit_lox.item_manager');
        $user = $this->get('security.context')->getToken()->getUser();
        $item = $im->findItemByPath($user, $path);

        if ($item) {
            if ($key = $im->getItemKey($item, $user)) {
                return new JsonResponse(
                    array('iv' => $key->getIv(), 'key' => $key->getKey())
                );
            } else {
                return new Response('Key not found', 404);
            }
        }

        return new Response('Path not found', 404);
    }
}
