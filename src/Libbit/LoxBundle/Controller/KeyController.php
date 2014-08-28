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
     * The expected key is a EAS 256bits (Rijndael) key encrypted using a RSA 2048
     * publickey belonging to the supplied user.
     *
     * <p><strong>Example JSON request</strong></p>
     * <pre>{
     *     "key"     : "GYRBAC54vZVXjK...WvruVr/PX",
     *     "iv"      : "iBEgIJGRSiUCYR...GMgEOjEFg",
     *     "username": "user"
     * }</pre>
     *
     *
     * @Route("/lox_api/key/{path}", name="libbit_lox_api_set_key_path", requirements={"path" = ".+"})
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

        $item = $im->findItemByPath($user, $path);

        if (isset($data['username'])) {
            $user = $this->get('rednose_framework.user_manager')->findUserBy(
                array('username' => $data['username'])
            );
        }

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
     * Get a path's key and initialization vector for the session user.
     *
     * <p><strong>Example JSON response</strong></p>
     * <pre>{
     *     "key" : "GYRBAC54vZVXjK...WvruVr/PX",
     *     "iv"  : "iBEgIJGRSiUCYR...GMgEOjEFg"
     * }</pre>
     *
     *
     * @Route("/lox_api/key/{path}", name="libbit_lox_api_get_key_path", requirements={"path" = ".+"})
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

    /**
     * Revoke a path's key for the session user or a supplied user.
     *
     * <p><strong>Example JSON request (optional)</strong></p>
     * <pre>{
     *     "username" : "username",
     * }</pre>
     *
     * @Route("/lox_api/key_revoke/{path}", name="libbit_lox_api_revoke_key_path", requirements={"path" = ".+"})
     * @Method({"POST"})
     *
     * @ApiDoc(
     *     section="Key",
     *     statusCodes={
     *         200="Returned when successful.",
     *         403="Forbidden, key has wrong owner.",
     *         404="Returned when the path."
     *     }
     * )
     */
    public function revokeKeyPathAction($path)
    {
        $im      = $this->get('libbit_lox.item_manager');
        $request = $this->get('request');
        $user    = $this->get('security.context')->getToken()->getUser();

        if ($data = json_decode($request->getContent(), true)) {
            if (isset($data['username'])) {
                $user = $this->get('rednose_framework.user_manager')->findUserBy(
                    array('username' => $data['username'])
                );
            }
        }

        $item = $im->findItemByPath($user, $path);

        if ($item) {
            if ($im->revokeItemKey($item, $user)) {
                return new Response('Success', 200);
            } else {
                return new Response('Forbidden, wrong owner', 403);
            }
        }

        return new Response('Path not found', 404);
    }
}
