<?php

namespace Libbit\LoxBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\Annotations\RequestParam;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Get;

class LinkController extends Controller
{
    // -- Web Methods ---------------------------------------------------------

    /**
     * @Route("/public/{path}", name="libbit_lox_links_path", defaults={"path": null}, requirements={"path" = ".+"})
     * @Method({"GET"})
     */
    public function getAction($path)
    {
        $lm = $this->get('libbit_lox.link_manager');

        $link = $lm->getLinkByPath($path);

        $response = new Response();

        if ($link === null) {
            $response->setStatusCode(404);

            return $response;
        }

        $item = $link->getItem();

        $response->setStatusCode(200);
        $response->setContent(file_get_contents($item->getRevision()->getFile()->getRealpath()));

        $response->headers->add(array(
            'Content-Type' => $item->getRevision()->getFile()->getMimeType(),
        ));

        return $response;
    }

    /**
     * @Route("/links/create/{path}", name="libbit_lox_links_create", defaults={"path": null}, requirements={"path" = ".+"})
     * @Method({"GET"})
     */
    public function createAction($path)
    {
        return $this->handleCreateLink($path);
    }

    /**
     * @Route("/links/remove/{id}", defaults={"id": null}, name="libbit_lox_links_remove")
     * @Method({"POST"})
     */
    public function removeAction($id)
    {
        $request  = $this->get('request');
        $token    = $request->request->get('token');
        $user     = $this->get('security.context')->getToken()->getUser();
        $lm       = $this->get('libbit_lox.link_manager');
        $response = new Response();

        if ($this->get('form.csrf_provider')->isCsrfTokenValid('web', $token) === false) {
            $response = new Response();

            $response->setStatusCode(403);

            return $response;
        }

        $link = $lm->getLinkByPublicId($id);

        if ($link === null || $link->getOwner()->isEqualTo($user) === false) {
            $response->setStatusCode(404);

            return $response;
        }

        $lm->removeLink($link);

        return $response;
    }

    // -- API Methods ----------------------------------------------------------

    /**
     * Returns a public URL to a given file.
     * <p><strong>Example JSON response</strong></p>
     * <pre>{
     *     "url": "https://localbox.rednose.nl/public/524abf3319b4b/test%20%281%29.pdf",
     * }</pre>
     *
     * @param string $path The full path to the file.
     *
     * @Post("/links/{path}", name="libbit_lox_api_post_link", defaults={"path" = ""}, requirements={"path" = ".+"})
     *
     * @ApiDoc(
     *     section="Files and folders",
     *     description="Generates a public URL to a given file.",
     *     statusCodes={
     *         201="Returned when the resource was successfully created.",
     *         404="Returned when the given path isn't found."
     *     }
     * )
     */
    public function postLinkAction($path)
    {
        return $this->handleCreateLink($path, true);
    }

    // -- Protected Methods ----------------------------------------------------

    protected function handleCreateLink($path, $api = false)
    {
        $im     = $this->get('libbit_lox.item_manager');
        $lm     = $this->get('libbit_lox.link_manager');
        $user   = $this->get('security.context')->getToken()->getUser();
        $router = $this->get('router');

        $response = $api === true ? new JsonResponse : new Response;

        // Check if item exists at the given path.
        $item = $im->findItemByPath($user, $path);

        if ($item === null) {
            $response->setStatusCode(404);

            return $response;
        }

        // Confirm that there is no link yet for this user.
        $link = $lm->findLinkByUser($user, $item);

        // Create the link.
        if ($link === null) {
            $link = $lm->createLink($item, $user);
        }

        $url = $this->generateUrl('libbit_lox_links_path', array(
            'path' => $link->getPublicId().'/'.$link->getItem()->getTitle(),
        ), true);

        if ($api === true) {
            $response->setStatusCode(201);
            $response->setContent(json_encode(array(
                'url' =>$url,
            )));

            return $response;
        }

        return $this->redirect($url);
    }
}
