<?php

namespace Rednose\LoxBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\SerializationContext;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Util\Codes;

class ShareController extends Controller
{
    /**
     * @Route("/shares/{path}", name="rednose_lox_shares_get", requirements={"path" = ".+"}, defaults={"path" = ""})
     * @Method({"GET"})
     */
    public function getShareAction($path)
    {
        $im   = $this->get('rednose_lox.item_manager');
        $sm   = $this->get('rednose_lox.share_manager');
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
     * @Route("/shares/{path}/new", name="rednose_lox_shares_new", requirements={"path" = ".+"}, defaults={"path" = ""})
     * @Method({"POST"})
     */
    public function newShareAction($path)
    {
        $em = $this->get('doctrine')->getEntityManager();
        $sm = $this->get('rednose_lox.share_manager');

        $user  = $this->get('security.context')->getToken()->getUser();
        $item  = $this->get('rednose_lox.item_manager')->findItemByPath($user, $path);
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

        $share = $sm->createShare($item, $groups, $users);

        return new Response;
    }

    /**
     * @Route("/shares/{id}/edit", name="rednose_lox_shares_edit")
     * @Method({"POST"})
     */
    public function editShareAction($id)
    {
        // TODO: Use Share manager so we create invites
        $em = $this->get('doctrine')->getEntityManager();
        $sm = $this->get('rednose_lox.share_manager');

        $share = $em->getRepository('Rednose\LoxBundle\Entity\Share')->findOneById($id);
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
     * @Route("/shares/{id}/remove", name="rednose_lox_shares_remove")
     * @Method({"POST"})
     */
    public function removeShareAction($id)
    {
        $sm = $this->get('rednose_lox.share_manager');

        $share = $sm->findShareBy(array('id' => $id));

        $sm->removeShare($share);

        return new Response;
    }

    /**
     * @Route("/shares/{path}/leave", name="rednose_lox_shares_leave", requirements={"path" = ".+"}, defaults={"path" = ""})
     * @Method({"POST"})
     */
    public function leaveShareAction($path)
    {
        $im = $this->get('rednose_lox.item_manager');
        $sm = $this->get('rednose_lox.share_manager');

        $user   = $this->get('security.context')->getToken()->getUser();
        $item   = $im->findItemByPath($user, $path);
        $invite = $sm->findInvitationByItem($user, $item);

        $sm->revokeInvitation($invite);

        return new Response;
    }

    /**
     * @Route("/identities", name="rednose_lox_identities")
     * @Method({"GET"})
     */
    public function getIdentitiesAction()
    {
        $request = $this->get('request');

        $query    = $request->query->get('q');
        $callback = $request->query->get('callback');

        $groups = $this->getGroups($query);
        $users  = $this->getUsers($query);

        $serializedGroups = array();
        $serializedUsers  = array();

        foreach ($groups as $group) {
            $serializedGroups[] = array(
                'id'    => 'group_'.$group->getId(),
                'title' => $group->getName(),
                'type'  => 'group',
            );
        }

        foreach ($users as $user) {
            $serializedUsers[] = array(
                'id'    => 'user_'.$user->getId(),
                'title' => $user->getBestName(),
                'type'  => 'user',
            );
        }

        $data = json_encode(array_merge($serializedGroups, $serializedUsers));

        return new Response($callback ? $callback.'('.$data.');' : $data, 200, array(
            'Content-Type' => 'application/json'
        ));
    }

    protected function getGroups($query = '')
    {
        $qb = $this->get('doctrine.orm.entity_manager')->createQueryBuilder();

        $qb->select('g');
        $qb->from('RednoseFrameworkBundle:Group', 'g');

        if ($query !== null) {
            $qb->add('where', $qb->expr()->like('g.name', ':name'));
            $qb->setParameter('name', '%'.$query.'%');
        }

        $qb->orderBy('g.name', 'ASC');

        return $qb->getQuery()->execute();
    }

    protected function getUsers($query = '')
    {
        $qb = $this->get('doctrine.orm.entity_manager')->createQueryBuilder();

        $qb->select('u');
        $qb->from('RednoseFrameworkBundle:User', 'u');

        if ($query !== null) {
            $qb->add('where', $qb->expr()->orX(
                $qb->expr()->like('u.username', ':name'),
                $qb->expr()->like('u.realname', ':name')
            ));

            $qb->setParameter('name', '%'.$query.'%');
        }

        $qb->orderBy('u.realname, u.username', 'ASC');

        return $qb->getQuery()->execute();
    }
}
