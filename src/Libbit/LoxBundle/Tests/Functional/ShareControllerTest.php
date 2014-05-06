<?php

namespace Libbit\LoxBundle\Tests\Functional;

use Libbit\LoxBundle\Entity\Item;
use Rednose\FrameworkBundle\Entity\Group;

class ShareControllerTest extends WebTestCase
{
    /**
     * @var \Libbit\LoxBundle\Entity\ShareManager
     */
    protected $shareManager = null;

    /**
     * @var \FOS\UserBundle\Doctrine\GroupManager
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
        $this->shareManager = $this->client->getContainer()->get('libbit_lox.share_manager');

        parent::setUp();

        // Create a group
        $group = $this->em->getRepository('Rednose\FrameworkBundle\Entity\Group')->findOneByName('Share test group');

        if ($group === null) {
            $group = new Group('Share test group', array('ROLE_USER'));

            $this->groupManager->updateGroup($group, true);
        }

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

        // Create third user
        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test3');

        if ($user === null) {
            $userUtil = $this->client->getContainer()->get('fos_user.util.user_manipulator');
            $user = $userUtil->create('test3', 'test3passwd', 'test3@libbit.eu', true, false);
            $user->addGroup($group);
            $user->setRealname('Test user 3');
            $this->em->persist($user);

            $this->em->flush();
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

        $this->acceptInvitations($user);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        return $settings;
    }

    /**
     * @depends testCreateShare
     */
    public function testUpdateShare($settings)
    {
        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test3');
        $group = $this->em->getRepository('Rednose\FrameworkBundle\Entity\Group')->findOneByName('Share test group');
        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByTitle('shared-dir');

        $share = $item->getShare();
        $route = $this->getRoute('libbit_lox_api_shares_edit', array('id' => $share->getId()));

        $settings['identities'][] = array('id' => 'group_' . $group->getId(), 'type' => 'group');

        $this->client->request(
            'POST',
            $route,
            array(), array(), array(), json_encode($settings)
        );

        $this->acceptInvitations($user);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        return $settings;
    }

    /**
     * @depends testUpdateShare
     */
    public function testGetShareSettings($settings)
    {
        $user = false;
        $group = false;

        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByTitle('shared-dir');

        $route = $this->getRoute('libbit_lox_api_shares_get', array('path' => $item->getTitle()));

        $this->client->request('GET', $route);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $data = $data['identities'];

        foreach ($data as $identity) {
            foreach ($settings['identities'] as $setting) {
                if ($setting['type'] === 'user' && $setting['id'] === $identity['id']) {
                    $user = true;
                }

                if ($setting['type'] === 'group' && $setting['id'] === $identity['id']) {
                    $group = true;
                }
            }
        }

        $this->assertEquals(true, $user);
        $this->assertEquals(true, $group);
    }

    protected function acceptInvitations($user)
    {
        $invitations = $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findByReceiver($user);

        foreach ($invitations as $invite) {
            $this->shareManager->acceptInvitation($invite);
        }
    }

    protected function getRoute($name, $variables)
    {
        return $this->client->getContainer()->get('router')->generate($name, $variables, false);
    }
}
