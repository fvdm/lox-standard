<?php

namespace Rednose\LoxBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Rednose\LoxBundle\Entity\Item;
use Rednose\LoxBundle\Entity\Revision;
use Rednose\LoxBundle\Entity\ItemManager;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Symfony\Component\HttpFoundation\JsonResponse;
use FOS\RestBundle\Request\ParamFetcher;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use FOS\RestBundle\Controller\Annotations\RequestParam;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Get;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Rednose\FrameworkBundle\HttpFoundation\DownloadResponse;
use FOS\RestBundle\View\View;
use JMS\Serializer\SerializationContext;
use FOS\RestBundle\Util\Codes;

class FileController extends Controller
{
    // -- Web Methods ----------------------------------------------------------

    /**
     * @Route("/get/{path}", name="rednose_lox_item", requirements={"path" = ".+"}, defaults={"path" = ""})
     * @Method({"GET"})
     */
    public function getAction($path)
    {
    	$request  = $this->get('request');
        $token    = $request->query->get('token');
    	$download = $request->query->get('download');
 	   	$im       = $this->get('rednose_lox.item_manager');
        $user     = $this->get('security.context')->getToken()->getUser();

    	$item = $im->findItemByPath($user, $path);

    	$response = new Response();

    	if ($item === null || $item->getIsDir()) {
	    	$response->setStatusCode(Codes::HTTP_NOT_FOUND);

	    	return $response;
    	}

        $content = file_get_contents($item->getRevision()->getFile()->getRealpath());
    	$response->setContent($content);

        $response->headers->add(array(
            'Content-Type'   => $item->getMimeType(),
            'Content-Length' => strlen($content),
        ));

    	if ($download) {
	        $response->headers->add(array(
	    		'Content-Disposition' => 'attachment; filename="'.$item->getTitle().'"',
    		));
    	}

    	return $response;
    }

    // -- API Methods ----------------------------------------------------------

    /**
     * @Route("/upload", name="rednose_lox_item_upload")
     * @Method({"POST"})
     */
    public function uploadAction()
    {
    	$request  = $this->get('request');
        $token    = $request->request->get('token');
		$path     = $request->request->get('path');
 	   	$im       = $this->get('rednose_lox.item_manager');
        $user     = $this->get('security.context')->getToken()->getUser();
    	$response = new Response();

        if ($this->get('form.csrf_provider')->isCsrfTokenValid('web', $token) === false) {
            $response = new Response();

            $response->setStatusCode(Codes::HTTP_FORBIDDEN);

            return $response;
        }

    	foreach($request->files as $uploadedFile) {
		    if ($uploadedFile->isValid()) {
		    	$parent = $im->findItemByPath($user, $path);

	    		if ($parent === null) {
					$response->setStatusCode(Codes::HTTP_NOT_FOUND);

					return $response;
	    		}

                $title = $uploadedFile->getClientOriginalName();

                $item = $im->findItemByPath($user, $path.'/'.$title);

                if ($item === null) {
    	    		$item = $im->createFileItem($user, $parent);
                    $item->setTitle($title);
                }

                if ($item->getIsDir() === true) {
                    $response->setStatusCode(Codes::HTTP_FORBIDDEN);

                    return $response;
                }

                $revision = new Revision;

                $revision->setUser($user);
                $revision->setFile($uploadedFile);
                $item->addRevision($revision);

		    	$im->saveItem($item);

		    	return $response;
		    }
		}

    	$response->setStatusCode(Codes::HTTP_BAD_REQUEST);

    	return $response;
    }

    /**
     * Downloads a file.
     *
     * @param string $path The full path to the file.
     *
     * @return Response
     *
     * @Route("/lox_api/files/{path}", name="rednose_lox_api_get_file", defaults={"path" = ""}, requirements={"path" = ".+"})
     * @Method({"GET"})
     *
     * @ApiDoc(
     *     section="Files and folders",
     *     description="Downloads a file.",
     *     statusCodes={
     *         200="Returned when successful.",
     *         404="Returned when the file isn't found."
     *     }
     * )
     */
    public function getFileAction($path)
    {
        $im   = $this->get('rednose_lox.item_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $item = $im->findItemByPath($user, $path);

        $response = new JsonResponse();

        if ($item) {
            $content = file_get_contents($item->getRevision()->getFile()->getRealpath());
            $response->setContent($content);

            $response->headers->add(array(
                'Content-Type'   => $item->getMimeType(),
                'Content-Length' => strlen($content),
            ));
        } else {
            $response->setStatusCode(404);
        }

        return $response;
    }

    /**
     * Uploads a file.
     *
     * @param string $path The full destination path for the uploaded file.
     *
     * @return Response
     *
     * @Route("/lox_api/files/{path}", name="rednose_lox_api_post_file", defaults={"path" = ""}, requirements={"path" = ".+"})
     * @Method({"POST"})
     *
     * @ApiDoc(
     *     section="Files and folders",
     *     description="Uploads a file.",
     *     statusCodes={
     *         201="Returned when the resource was successfully created.",
     *         403="Returned when the given path is invalid.",
     *         404="Returned when the given path isn't found."
     *     }
     * )
     */
    public function postFileAction($path)
    {
        // TODO: 403
        $user      = $this->get('security.context')->getToken()->getUser();
        $im        = $this->get('rednose_lox.item_manager');
        $pathParts = pathinfo($path);
        $response  = new JsonResponse();
        $request   = $this->getRequest();
        $parent    = null;

        if ($pathParts['dirname'] !== '.') {
            $parent = $im->findItemByPath($user, $pathParts['dirname']);

            if ($parent === null) {
                $response->setStatusCode(Codes::HTTP_NOT_FOUND);

                return $response;
            }
        }

        $title = $pathParts['basename'];

        $tmpFile = tempnam(sys_get_temp_dir(), 'File');
        file_put_contents($tmpFile, $request->getContent());

        $item = $im->findItemByPath($user, $path);

        if ($item === null) {
            $item = $im->createFileItem($user, $parent);

            $item->setTitle($title);
        }

        if ($item->getIsDir() === true) {
            $response->setStatusCode(Codes::HTTP_FORBIDDEN);

            return $response;
        }

        $revision = new Revision;

        $revision->setUser($user);
        $revision->setFile(new UploadedFile($tmpFile, $pathParts['basename'], null, null, null, true));

        $item->addRevision($revision);

        $im->saveItem($item);

        $response->setStatusCode(201);

        return $response;
    }
}
