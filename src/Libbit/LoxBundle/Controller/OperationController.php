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
use Rednose\FrameworkBundle\HttpFoundation\DownloadResponse;
use FOS\RestBundle\View\View;
use JMS\Serializer\SerializationContext;
use FOS\RestBundle\Util\Codes;

class OperationController extends Controller
{
    // -- Web Methods ----------------------------------------------------------

    /**
     * @Route("/operations/copy", name="libbit_lox_post_operations_copy")
     * @Method({"POST"})
     */
    public function postOpsCopyAction()
    {
        return $this->postOperationsCopyAction();
    }

    /**
     * @Route("/operations/create_folder", name="libbit_lox_post_operations_create_folder")
     * @Method({"POST"})
     */
    public function postOpsCreateFolderAction()
    {
        return $this->postOperationsCreateFolderAction();
    }

    /**
     * @Route("/operations/delete", name="libbit_lox_post_operations_delete")
     * @Method({"POST"})
     */
    public function postOpsDeleteAction()
    {
        return $this->postOperationsDeleteAction();
    }

    /**
     * @Route("/operations/move", name="libbit_lox_post_operations_move")
     * @Method({"POST"})
     */
    public function postOpsMoveAction()
    {
        return $this->postOperationsMoveAction();
    }

    // -- API Methods ----------------------------------------------------------

    /**
     * Copies a file or folder.
     *
     * @Post("/lox_api/operations/copy", name="libbit_lox_api_post_operations_copy")
     *
     * @RequestParam(name="from_path", strict=true, requirements="String", description="The path to copy the file or folder from.")
     * @RequestParam(name="to_path", strict=true, requirements="String", description="The path to copy the file or folder to.")
     *
     * @ApiDoc(
     *     section="Operations",
     *     description="Copies a file or folder.",
     *     statusCodes={
     *         200="Returned when successful.",
     *         400="Returned when the `from_path` or `to_path` parameter isn't set.",
     *         403="Returned when the file or folder was attempted to be copied to an invalid location.",
     *         404="Returned when the file or folder isn't found."
     *     }
     * )
     */
    public function postOperationsCopyAction()
    {
        // TODO: Deep clones.
        // TODO: Clone file data as well.
        // TODO: 403
        $im       = $this->get('libbit_lox.item_manager');
        $user     = $this->get('security.context')->getToken()->getUser();
        $request  = $this->get('request');
        $response = new JsonResponse();

        $fromPath = $request->request->get('from_path', null);
        $toPath   = $request->request->get('to_path', null);

        if ($fromPath === null || $toPath === null) {
            $response->setstatuscode(400);
            $response->setcontent(json_encode(array(
                'error' => 'Parameters `from_path` and `to_path` are required.',
            )));

            return $response;
        }

        $fromItem = $im->findItemByPath($user, $fromPath);

        $parts        = explode('/', $toPath);
        $toTitle      = array_pop($parts);
        $toParentPath = implode('/', $parts);

        $toParent = $im->findItemByPath($user, $toParentPath);

        if ($fromItem === null) {
            $response->setStatusCode(404);
            $response->setContent(json_encode(array(
                'error' => sprintf('File or folder not found at path \'%s\'.', $fromPath),
            )));

            return $response;
        }

        if ($toParent === null) {
            $response->setStatusCode(404);
            $response->setContent(json_encode(array(
                'error' => sprintf('Folder not found at path \'%s\'.', $toPath),
            )));

            return $response;
        }

        if ($fromItem->hasShareof() || $fromItem->hasShares()) {
            $response->setStatusCode(403);
            $response->setContent(json_encode(array(
                'error' => sprintf('Cannot copy shared folders.'),
            )));

            return $response;
        }

        // Check for an existing file or folder at the given path.
        if ($im->findItemByPath($user, $toPath) !== null) {
            $toTitle = $this->incrementTitle($user, $toTitle, $toParent);
        }

        $copy = $im->copyItem($fromItem, $toParent, $toTitle);

        $view = View::create();
        $handler = $this->get('fos_rest.view_handler');

        $context = SerializationContext::create();

        $context->setGroups(array('list'));
        $view->setSerializationContext($context);

        $view->setData($copy);
        $view->setFormat('json');

        return $handler->handle($view);
    }

    /**
     * Creates a folder.
     *
     * @Post("/lox_api/operations/create_folder", name="libbit_lox_api_post_operations_create_folder")
     *
     * @RequestParam(name="path", strict=true, description="The path to the new folder.")
     *
     * @ApiDoc(
     *     section="Operations",
     *     description="Creates a folder.",
     *     statusCodes={
     *         200="Returned when successful.",
     *         400="Returned when the `path` parameter isn't set.",
     *         403="Returned when the folder location is invalid."
     *     }
     * )
     */
    public function postOperationsCreateFolderAction()
    {
        // TODO: 404
        $im       = $this->get('libbit_lox.item_manager');
        $response = new JsonResponse();
        $request  = $this->get('request');
        $user     = $this->get('security.context')->getToken()->getUser();

        $path = $request->request->get('path', null);

        if ($path === null) {
            $response->setstatuscode(400);
            $response->setcontent(json_encode(array(
                'error' => 'Parameter `path` is required.',
            )));

            return $response;
        }

        // Remove trailing slash if needed.
        $path = rtrim($path, '/');

        if ($path === '') {
            $response->setstatuscode(403);
            $response->setcontent(json_encode(array(
                'error' => 'Please provide a name for the new folder.',
            )));

            return $response;
        }

        // Check for an existing file or folder at the given path.
        $item = $im->findItemByPath($user, $path);

        if ($item !== null) {
            $response->setstatuscode(403);
            $response->setcontent(json_encode(array(
                'error' => 'Can\'t create the folder, a file or folder already exists at this location.',
            )));

            return $response;
        }

        $pathParts = explode('/', $path);
        $title     = array_pop($pathParts);
        $path      = implode('/', $pathParts);

        if ($path === '') {
            $path = '/';
        }

        if ($path && $title) {
            $parent = $im->findItemByPath($user, $path);

            $dir = $im->createFolderItem($user, $parent);
            $dir->setTitle($title);

            $im->saveItem($dir);

            if ($dir) {
                $view = View::create();
                $handler = $this->get('fos_rest.view_handler');

                $context = SerializationContext::create();

                $context->setGroups(array('list'));
                $view->setSerializationContext($context);

                $view->setData($dir);
                $view->setFormat('json');

                return $handler->handle($view);
            }
        }

        $response->setstatuscode(403);
        $response->setcontent(json_encode(array(
            'error' => 'Please provide a valid path.',
        )));

        return $response;
    }

    /**
     * Deletes a file or folder.
     *
     * @Post("/lox_api/operations/delete", name="libbit_lox_api_post_operations_delete")
     *
     * @RequestParam(name="path", strict=true, requirements="String", description="The path to the file or folder.")
     *
     * @ApiDoc(
     *     section="Operations",
     *     description="Deletes a file or folder.",
     *     statusCodes={
     *         200="Returned when successful.",
     *         400="Returned when the `path` parameter isn't set.",
     *         404="Returned when the file or folder isn't found."
     *     }
     * )
     */
    public function postOperationsDeleteAction()
    {
        $request  = $this->get('request');
        $response = new JsonResponse();
        $user     = $this->get('security.context')->getToken()->getUser();

        $path = $request->request->get('path', null);

        if ($path === null) {
            $response->setStatusCode(400);
            $response->setContent(json_encode(array(
                'error' => 'Parameter `path` is required.',
            )));

            return $response;
        }

        $im   = $this->get('libbit_lox.item_manager');
        $item = $im->findItemByPath($user, $path);

        if ($item !== null) {
            $im->removeItem($item);

            $response->setContent(null);

            return $response;
        }

        $response->setStatusCode(404);
        $response->setContent(json_encode(array(
            'error' => sprintf('File or folder not found at path \'%s\'.', $path),
        )));

        return $response;
    }

    /**
     * Moves a file or folder.
     *
     * @Post("/lox_api/operations/move", name="libbit_lox_api_post_operations_move")
     *
     * @RequestParam(name="from_path", strict=true, requirements="String", description="The path to copy the file or folder from.")
     * @RequestParam(name="to_path", strict=true, requirements="String", description="The path to copy the file or folder to.")
     *
     * @ApiDoc(
     *     section="Operations",
     *     description="Moves a file or folder.",
     *     statusCodes={
     *         200="Returned when successful.",
     *         400="Returned when the `from_path` or `to_path` parameter isn't set.",
     *         403="Returned when the file or folder was attempted to be moved to an invalid location.",
     *         404="Returned when the file or folder isn't found."
     *     }
     * )
     */
    public function postOperationsMoveAction()
    {
        $im       = $this->get('libbit_lox.item_manager');
        $request  = $this->get('request');
        $user     = $this->getUser();
        $response = new JsonResponse();

        $fromPath = $request->request->get('from_path', null);
        $toPath   = $request->request->get('to_path', null);

        if ($fromPath === null || $toPath === null) {
            $response->setstatuscode(400);
            $response->setcontent(json_encode(array(
                'error' => 'Parameters `from_path` and `to_path` are required.',
            )));

            return $response;
        }

        if ($fromPath === $toPath) {
            $response->setstatuscode(403);
            $response->setcontent(json_encode(array(
                'error' => 'Source path can\'t be the same as the destination path',
            )));

            return $response;
        }

        /** @var Item $fromItem */
        $fromItem = $im->findItemByPath($user, $fromPath);

        if ($fromItem->getOwner()->isEqualTo($user) === false) {
            $fromItem = $fromItem->getShareForUser($user);
        }

        $parts    = explode('/', $toPath);
        $toTitle  = array_pop($parts);
        $toParent = implode('/', $parts);

        $toParent = $im->findItemByPath($user, $toParent);

        if ($fromItem === null) {
            $response->setStatusCode(404);
            $response->setContent(json_encode(array(
                'error' => sprintf('File or folder not found at path \'%s\'.', $fromPath),
            )));

            return $response;
        }

        if ($toParent === null) {
            $response->setStatusCode(404);
            $response->setContent(json_encode(array(
                'error' => sprintf('Folder not found at path \'%s\'.', $toPath),
            )));

            return $response;
        }

        // Check for recursion.
        if ($this->itemContainsPath($fromItem, $toPath)) {
            $response->setstatuscode(403);
            $response->setcontent(json_encode(array(
                'error' => 'You can\'t move a folder into itself.',
            )));

            return $response;
        }

        if ($this->bothItemsAreShared($fromItem, $toParent)) {
            $response->setstatuscode(403);
            $response->setcontent(json_encode(array(
                'error' => 'You can\'t move a shared folder into another shared folder.',
            )));

            return $response;
        }

        // Check for an existing file or folder at the given path and increment the title if needed.
        if ($im->findItemByPath($user, $toPath) !== null) {
            $toTitle = $this->incrementTitle($user, $toTitle, $toParent);
        }

        $moved = $im->moveItem($fromItem, $toParent, $toTitle);

        $view = View::create();
        $handler = $this->get('fos_rest.view_handler');

        $context = SerializationContext::create();

        $context->setGroups(array('list'));
        $view->setSerializationContext($context);

        $view->setData($moved);
        $view->setFormat('json');

        return $handler->handle($view);
    }

    protected function itemContainsPath($item, $path)
    {
        $user = $this->get('security.context')->getToken()->getUser();
        $im   = $this->get('libbit_lox.item_manager');

        // Remove the title, so we don't flag folder renames as false positives.
        $parts = explode('/', $path);
        array_pop($parts);
        $parent = implode('/', $parts);

        return $this->startsWith($parent, $im->getPathForUser($user, $item));
    }

    protected function bothItemsAreShared($item, $toParent)
    {
        return ($item->isShared() || $item->isShare()) && $this->isOrIsInsideSharedFolder($toParent);
    }

    // Refactor, this should be in the Item manager
    private function isOrIsInsideSharedFolder($item)
    {
        if ($item->isShared() || $item->isShare()) {
            return true;
        }

        if ($item->getParent() === null) {
            return false;
        }

        return $this->isOrIsInsideSharedFolder($item->getParent());
    }

    private function startsWith($haystack, $needle)
    {
        return $needle === '' || strpos($haystack, $needle) === 0;
    }

    // TODO: Move to event handler or domain manager
    private function incrementTitle($user, $title, $parent, $index = 1)
    {
        $user = $this->get('security.context')->getToken()->getUser();
        $im   = $this->get('libbit_lox.item_manager');

        $parts = pathinfo($title);

        $newTitle = $parts['filename'].' ('.$index.')';

        if (isset($parts['extension'])) {
            $newTitle .= '.'.$parts['extension'];
        }

        $parentPath = $im->getPathForUser($user, $parent);

        $im = $this->get('libbit_lox.item_manager');

        if ($im->findItemByPath($user, $newTitle) !== null) {
            return $this->incrementTitle($user, $title, $parent, $index + 1);
        }

        return $newTitle;
    }
}
