<?php

namespace Libbit\LoxBundle\Entity;

use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManager;

class IdentityManager
{
    /*
     * @var EntityManager
     */
    protected $em;

    /*
     * @var Request
     */
    protected $request;

    /*
     * Constructor
     *
     * @param $em EntityManager
     */
    public function __construct(EntityManager $em, Request $request)
    {
        $this->em      = $em;
        $this->request = $request;
    }

    /*
     * Get all identities (users and groups)
     *
     * @return array
     */
    public function getIdentities()
    {
        $request = $this->request;
        $query   = $request->query->get('q');

        $groups = $this->getGroups($query);
        $users  = $this->getUsers($query);

        $serializedGroups = array();
        $serializedUsers  = array();

        foreach ($groups as $group) {
            $serializedGroups[] = array(
                'id'       => 'group_'.$group->getId(),
                'title'    => $group->getName(),
                'type'     => 'group',
            );
        }

        foreach ($users as $user) {
            $serializedUsers[] = array(
                'id'       => 'user_'.$user->getId(),
                'title'    => $user->getBestName(),
                'username' => $user->getUsername(),
                'has_keys' => (bool)$this->em->getRepository('Libbit\LoxBundle\Entity\KeyPair')->findOneByUser($user),
                'type'     => 'user',
            );
        }

        return array_merge($serializedGroups, $serializedUsers);
    }

    /*
     * Get all users in a group
     *
     * @return ArrayCollection
     */
    public function getUsersByGroup($id)
    {
        $id    = (int)$id;
        $group = $this->em->getRepository('RednoseFrameworkBundle:Group')->findOneById($id);
        $users = $group->getUsers();

        return $users;
    }

    /*
     * Get or find groups
     *
     * @param string $query
     */
    protected function getGroups($query = '')
    {
        $qb = $this->em->createQueryBuilder();

        $qb->select('g');
        $qb->from('RednoseFrameworkBundle:Group', 'g');

        if ($query !== null) {
            $qb->add('where', $qb->expr()->like('g.name', ':name'));
            $qb->setParameter('name', '%'.$query.'%');
        }

        $qb->orderBy('g.name', 'ASC');

        return $qb->getQuery()->execute();
    }

    /*
     * Get or find users
     *
     * @param string $query
     */
    protected function getUsers($query = '')
    {
        $qb = $this->em->createQueryBuilder();

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
