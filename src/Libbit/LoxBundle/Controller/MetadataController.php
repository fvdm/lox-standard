<?php

namespace Libbit\LoxBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Response;
use Libbit\LoxBundle\Entity\Item;
use Libbit\LoxBundle\Entity\ItemManager;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Symfony\Component\HttpFoundation\JsonResponse;
use FOS\RestBundle\Request\ParamFetcher;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use FOS\RestBundle\Controller\Annotations\RequestParam;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\View\View;
use JMS\Serializer\SerializationContext;
use FOS\RestBundle\Util\Codes;

class MetadataController extends Controller
{
    // -- Web Methods ----------------------------------------------------------

    /**
     * @Route("/meta/{path}", name="libbit_lox_get_meta_path", requirements={"path" = ".+"}, defaults={"path" = "/"})
     * @Method({"GET"})
     */
    public function getMetadataAction($path)
    {
        return $this->handleGetMeta($path);
    }

    /**
     * @Route("/tree", name="libbit_lox_get_tree")
     * @Method({"GET"})
     */
    public function treeAction()
    {
        $im   = $this->get('libbit_lox.item_manager');
        $user = $this->get('security.context')->getToken()->getUser();
        $root = $im->getRootItem($user);

        if ($root) {
            $view = View::create();
            $handler = $this->get('fos_rest.view_handler');

            $context = SerializationContext::create()->enableMaxDepthChecks();

            $context->setGroups(array('tree'));
            $view->setSerializationContext($context);

            $view->setData($root);
            $view->setFormat('json');

            return $handler->handle($view);
        }

        $response = new JsonResponse();

        $response->setStatusCode(Codes::HTTP_NOT_FOUND);

        return $response;
    }

    // -- API Methods ----------------------------------------------------------

    /**
     * Returns metadata fot the item at <code>&lt;path&gt;</code>.
     * <p><strong>Example JSON response</strong></p>
     * <pre>{
     *     "title": "Home",
     *     "path": "\/",
     *     "modified_at": "2013-10-04T11:00:21+0200",
     *     "is_dir": true,
     *     "is_share": false,
     *     "children": [
     *         {
     *             "title": "test.txt",
     *             "path": "\/test.txt",
     *             "mime_type": "text\/plain",
     *             "modified_at": "2013-10-04T14:17:57+0200",
     *             "is_dir": false,
     *             "is_share": false,
     *             "revision": 3
     *         }
     *     ],
     *     "hash": "45de641c2916790b71b03d56287e0038"
     * }</pre>
     *
     * @param string $path The full path to the file or folder.
     *
     * @return Response
     *
     * @Get("/lox_api/meta/{path}", name="libbit_lox_api_get_meta_path", defaults={"path" = "/"}, requirements={"path" = ".+"})
     *
     * @QueryParam(name="hash", requirements="String", description="Optional hash parameter, returns <code>304 Not modified</code> if the metadata is unchanged.")
     *
     * @ApiDoc(
     *     section="Files and folders",
     *     output={ "class"="Libbit\LoxBundle\Entity\Item",
     *         "groups"={"details"}
     *     },
     *     description="Lists file or folder metadata.",
     *     statusCodes={
     *         200="Returned when successful.",
     *         304="Returned when the resource isn't modified.",
     *         404="Returned when the file or folder isn't found."
     *     }
     * )
     */
    public function getMetaAction($path)
    {
        return $this->handleGetMeta($path, true);
    }

    protected function handleGetMeta($path, $api = false)
    {
        $im     = $this->get('libbit_lox.item_manager');
        $user   = $this->get('security.context')->getToken()->getUser();
        $groups = $api === true ? array('details', 'api') : array('details', 'web');

        $request = $this->get('request');

        $response = new JsonResponse();

        $item = $im->findItemByPath($user, $path);

        if ($item === null) {
            $response->setStatusCode(Codes::HTTP_NOT_FOUND);

            return $response;
        }

        if ($api === true) {
            $hash = $request->query->get('hash');

            if ($hash !== null && $hash === $im->getHash($item)) {
                $response->setStatusCode(Codes::HTTP_NOT_MODIFIED);

                return $response;
            }
        }

        $view = View::create();
        $handler = $this->get('fos_rest.view_handler');

        $context = SerializationContext::create()->enableMaxDepthChecks();

        $context->setGroups($groups);
        $view->setSerializationContext($context);

        $view->setData($item);
        $view->setFormat('json');

        return $handler->handle($view);
    }
}
