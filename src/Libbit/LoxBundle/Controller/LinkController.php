<?php

namespace Libbit\LoxBundle\Controller;

use DateTime;
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
use FOS\RestBundle\View\View;
use JMS\Serializer\SerializationContext;
use Libbit\LoxBundle\Entity\Link;

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
     * @Method({"POST"})
     */
    public function createAction($path)
    {
        return $this->handleCreateLink($path);
    }

    /**
     * @Route("/links/update/{id}", defaults={"id": null}, name="libbit_lox_links_update")
     * @Method({"POST"})
     */
    public function updateAction($id)
    {
        $request = $this->get('request');
        $lm      = $this->get('libbit_lox.link_manager');
        $user    = $this->get('security.context')->getToken()->getUser();
        $date    = null;
        $data    = $request->getContent();
        $data    = json_decode($data);

        if (isset($data->expires) && $data->expires) {
            $date = new DateTime($data->expires);
        }

        if ($link = $lm->updateLink($id, $user, $date)) {
            $response = new Response('', 200);

            return $this->getView($link, $response);
        }

        return new Response('Error', 500);
    }

    /**
     * @Route("/links/remove/{id}", defaults={"id": null}, name="libbit_lox_links_remove")
     * @Method({"POST"})
     */
    public function removeAction($id)
    {
        $request  = $this->get('request');
        $user     = $this->get('security.context')->getToken()->getUser();
        $lm       = $this->get('libbit_lox.link_manager');
        $response = new Response();

        $token    = json_decode($request->getContent());
        $token    = $token->token;

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
     *     "public_id": "524abf3319b4b",
     *     "uri": "https://localbox.rednose.nl/public/524abf3319b4b/test%20%281%29.pdf"
     * }</pre>
     *
     * @param string $path The full path to the file.
     *
     * @Post("/lox_api/links/{path}", name="libbit_lox_api_post_link", defaults={"path" = ""}, requirements={"path" = ".+"})
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
        return $this->handleCreateLink($path);
    }

    // -- Protected Methods ----------------------------------------------------

    protected function handleCreateLink($path)
    {
        $im       = $this->get('libbit_lox.item_manager');
        $lm       = $this->get('libbit_lox.link_manager');
        $user     = $this->get('security.context')->getToken()->getUser();
        $router   = $this->get('router');
        $response = new JsonResponse;

        $date     = null;
        $data     = $this->get('request')->getContent();
        $data     = json_decode($data);

        if (isset($data->expires) && $data->expires) {
            $date = new DateTime($data->expires);
        }

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
            $link = $lm->createLink($item, $user, $date);
        }

        $response->setStatusCode(201);

        return $this->getView($link, $response);
    }

    protected function getView(Link $link, Response $response)
    {
        $handler  = $this->get('fos_rest.view_handler');

        $context = SerializationContext::create();
        $context->setGroups(array('details'));

        $view = View::create();
        $view->setSerializationContext($context);

        $view->setData($link);
        $view->setFormat('json');

        $response->setContent(
            $handler->handle($view)->getContent()
        );

        return $response;
    }
}
