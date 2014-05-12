<?php

namespace Libbit\LoxBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\SerializationContext;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Util\Codes;
use Libbit\LoxBundle\Entity\ItemManager;
use Libbit\LoxBundle\Entity\ShareManager;

class ShareController extends Controller
{
    // -- Web Methods ----------------------------------------------------------

    /**
     * @Route("/shares/{path}", name="libbit_lox_shares_get", requirements={"path" = ".+"}, defaults={"path" = ""})
     * @Method({"GET"})
     */
    public function getShareAction($path)
    {
        $im   = $this->get('libbit_lox.item_manager');
        $sm   = $this->get('libbit_lox.share_manager');
        $user = $this->get('security.context')->getToken()->getUser();

        $item = $im->findItemBypath($user, $path);

        if ($item === null) {
            return new Response(null, Codes::HTTP_NOT_FOUND);
        }

        $share = $sm->findShareByItem($user, $item);

        if ($share === null) {
            return new Response(null, Codes::HTTP_NOT_FOUND);
        }

        $view = View::create();
        $handler = $this->get('fos_rest.view_handler');

        $context = new SerializationContext();
        $context->setGroups(array('details'));
        $view->setSerializationContext($context);

        $view->setData($share);
        $view->setFormat('json');

        return $handler->handle($view);
    }

    /**
     * @Route("/shares/{path}/new", name="libbit_lox_shares_new", requirements={"path" = ".+"}, defaults={"path" = ""})
     * @Method({"POST"})
     */
    public function newShareAction($path)
    {
        $em = $this->get('doctrine')->getManager();
        $sm = $this->get('libbit_lox.share_manager');

        $user  = $this->get('security.context')->getToken()->getUser();
        $item  = $this->get('libbit_lox.item_manager')->findItemByPath($user, $path);
        $data  = json_decode($this->get('request')->getContent(), true);

        $groups = array();
        $users  = array();

        foreach ($data['identities'] as $identity) {
            if ($identity['type'] === 'user') {
                $user = $em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneById(substr($identity['id'], 5));
                $users[] = $user;
            }

            if ($identity['type'] === 'group') {
                $group = $em->getRepository('Rednose\FrameworkBundle\Entity\Group')->findOneById(substr($identity['id'], 6));
                $groups[] = $group;
            }
        }

        $sm->createShare($item, $groups, $users);

        return new Response;
    }

    /**
     * @Route("/shares/{id}/edit", name="libbit_lox_shares_edit")
     * @Method({"POST"})
     */
    public function editShareAction($id)
    {
        // TODO: Use Share manager so we create invites
        $em = $this->get('doctrine')->getManager();
        $sm = $this->get('libbit_lox.share_manager');

        $share = $em->getRepository('Libbit\LoxBundle\Entity\Share')->findOneById($id);
        $data  = json_decode($this->get('request')->getContent(), true);

        $users  = new ArrayCollection;
        $groups = new ArrayCollection;

        foreach ($data['identities'] as $identity) {
            if ($identity['type'] === 'user') {
                $user = $em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneById(substr($identity['id'], 5));
                $users->add($user);
            }

            if ($identity['type'] === 'group') {
                $group = $em->getRepository('Rednose\FrameworkBundle\Entity\Group')->findOneById(substr($identity['id'], 6));
                $groups->add($group);
            }
        }

        $share->setUsers($users);
        $share->setGroups($groups);

        $sm->saveShare($share);

        return new Response;
    }

    /**
     * @Route("/shares/{id}/remove", name="libbit_lox_shares_remove")
     * @Method({"POST"})
     */
    public function removeShareAction($id)
    {
        $sm = $this->get('libbit_lox.share_manager');

        $share = $sm->findShareBy(array('id' => $id));

        $sm->removeShare($share);

        return new Response;
    }

    /**
     * @Route("/shares/{path}/leave", name="libbit_lox_shares_leave", requirements={"path" = ".+"}, defaults={"path" = ""})
     * @Method({"POST"})
     */
    public function leaveShareAction($path)
    {
        /** @var ItemManager $im */
        $im = $this->get('libbit_lox.item_manager');

        /** @var ShareManager $sm */
        $sm = $this->get('libbit_lox.share_manager');

        $user = $this->getUser();
        $item = $im->findItemByPath($user, $path);

        $invite = $sm->findInvitationByItem($user, $item);

        if ($invite === null) {
            throw $this->createNotFoundException();
        }

        $sm->revokeInvitation($invite);

        return new Response;
    }

    /**
     * @Route("/share/identities", name="libbit_lox_identities")
     * @Method({"GET"})
     */
    public function getIdentitiesAction()
    {
        $callback = $this->get('request')->query->get('callback');

        $identManager = $this->get('libbit_lox.identity_manager');

        $data = $identManager->getIdentities();
        $data = json_encode($data);

        return new Response($callback ? $callback.'('.$data.');' : $data, 200, array(
            'Content-Type' => 'application/json'
        ));
    }

    // -- API Methods ----------------------------------------------------------

    /**
     * Get share settings for an Item
     *
     * <p><strong>Example JSON response</strong></p>
     * <pre>{
     *    "id": 11,
     *    "item": {
     *        "is_dir"     : true,
     *        "title"      : "Folder 5",
     *        "modified_at": "2014-04-30T18:28:42+0200",
     *        "is_shared"  : true,
     *        "is_share"   : false,
     *        "path"       : "\/Folder 5",
     *        "icon"       : "folder-shared"
     *    },
     *    "identities": [
     *        {
     *            "id"   : "group_57",
     *            "title": "Administrator",
     *            "type" : "group"
     *        }, {
     *            "id"   : "user_39",
     *            "title": "Demo user",
     *            "type" : "user"
     *        }
     *    ]
     *}</pre>
     *
     * @Route("/lox_api/shares/{path}", name="libbit_lox_api_shares_get", requirements={"path" = ".+"}, defaults={"path" = ""})
     * @Method({"GET"})
     *
     * @ApiDoc(
     *     section="Share",
     *     output={ "class"="Libbit\LoxBundle\Entity\Share",
     *         "groups"={"details"}
     *     },
     *
     *     statusCodes={
     *         200="Returned when successful."
     *     }
     * )
     */
    public function getApiShareAction($path)
    {
        return $this->getShareAction($path);
    }

    /**
     * Create new share settings for an Item
     *
     * <p><strong>Example JSON request</strong></p>
     * <pre>{
     *    "identities":[
     *        {
     *            "id":"group_57",
     *            "type":"group"
     *        }, {
     *            "id":"user_39",
     *            "type":"user"
     *        }
     *    ]
     *}</pre>
     *
     * @Route("/lox_api/share_create/{path}", name="libbit_lox_api_shares_new", requirements={"path" = ".+"}, defaults={"path" = ""})
     * @Method({"POST"})
     *
     * @ApiDoc(
     *     section="Share",
     *
     *     statusCodes={
     *         200="Returned when successful."
     *     }
     * )
     */
    public function newApiShareAction($path)
    {
        return $this->newShareAction($path);
    }

    /**
     * Update share settings for an Item
     *
     * <p><strong>Example JSON request</strong></p>
     * <pre>{
     *    "identities":[
     *        {
     *            "id":"group_57",
     *            "type":"group"
     *        }, {
     *            "id":"user_39",
     *            "type":"user"
     *        }
     *    ]
     *}</pre>
     *
     * @Route("/lox_api/shares/{id}/edit", name="libbit_lox_api_shares_edit")
     * @Method({"POST"})
     *
     * @ApiDoc(
     *     section="Share",
     *
     *     statusCodes={
     *         200="Returned when successful."
     *     }
     * )
     */
    public function editApiShareAction($id)
    {
        return $this->editShareAction($id);
    }
}
