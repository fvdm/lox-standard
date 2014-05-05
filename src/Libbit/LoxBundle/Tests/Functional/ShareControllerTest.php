<?php

namespace Libbit\LoxBundle\Tests\Functional;

use Libbit\LoxBundle\Entity\Item;
use Rednose\FrameworkBundle\Entity\Group;

class ShareControllerTest extends WebTestCase
{
    /**
     * @var \FOS\UserBundle\Doctrine\GroupManagers
     */
    protected $groupManager = null;

    /**
     * @var \Symfony\Bundle\FrameworkBundle\Client
     */
    protected $client;

    public function setUp()
    {
        $this->client = self::createClient();
        $this->groupManager = $this->client->getContainer()->get('fos_user.group_manager');

        parent::setUp();

        // Create primary user
        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test');

        if ($user === null) {
            $userUtil = $this->client->getContainer()->get('fos_user.util.user_manipulator');
            $user = $userUtil->create('test', 'testpasswd', 'test@libbit.eu', true, false);
            $user->setRealname('Test user');
            $this->em->persist($user);

            $this->em->flush();
        }

        // Create directory as share object
        if ($this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneBy(array('owner' => $user, 'title' => 'shared-dir')) === null) {
            $root = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByOwner($user);

            $dir = new Item;
            $dir->setTitle('shared-dir');
            $dir->setIsDir(true);
            $dir->setOwner($user);
            $dir->setParent($root);

            $this->em->persist($dir);
            $this->em->flush();
        }

        // Create secondary user
        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test2');

        if ($user === null) {
            $userUtil = $this->client->getContainer()->get('fos_user.util.user_manipulator');
            $user = $userUtil->create('test2', 'test2passwd', 'test2@libbit.eu', true, false);
            $user->setRealname('Test user 2');
            $this->em->persist($user);

            $this->em->flush();
        }

        // Create a group
        $group = $this->em->getRepository('Rednose\FrameworkBundle\Entity\Group')->findOneByName('Test group');

        if ($group === null) {
            $group = new Group('Test group', array('ROLE_USER'));

            $this->groupManager->updateGroup($group, false);
        }

        $this->client = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'test',
            'PHP_AUTH_PW'   => 'testpasswd',
        ));
    }

    public function testCreateShare()
    {
        $route = $this->getRoute('libbit_lox_api_shares_new', array('path' => '/shared-dir'));

        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test2');
        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByTitle('shared-dir');

        $settings = array(
            'identities' => array(
                array('id' => 'user_' . $user->getId(), 'type' => 'user')
            )
        );

        $this->client->request(
            'POST',
            $route,
            array(), array(), array(), json_encode($settings)
        );

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        return json_decode($this->client->getResponse()->getContent());
    }

    /**
     * @depends testCreateShare
     */
    public function testUpdateShare($item)
    {
        // STUB...
    }

    protected function getRoute($name, $variables)
    {
        return $this->client->getContainer()->get('router')->generate($name, $variables, false);
    }
}
