<?php

namespace Libbit\LoxBundle\Tests\Functional;

use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase as BaseWebTestCase;

use Libbit\LoxBundle\Entity\Item;
use Rednose\FrameworkBundle\Entity\Group;

/**
 * Base Functional test case. Inspired (copied) from FrameworkBundle and SecurityBundle's
 * functional test suites.
 */
class WebTestCase extends BaseWebTestCase
{
    /**
     * @var \FOS\UserBundle\Doctrine\GroupManager
     */
    protected $groupManager = null;

    /**
     * @var \Libbit\LoxBundle\Entity\ShareManager
     */
    protected $shareManager = null;

    /**
     * @var \Doctrine\Common\Persistence\ObjectManager
     */
    protected $em;

    /**
     * @var boolean
     */
    protected static $schemaSetUp = false;

    /**
     * @var string
     */
    protected $token = "";

    /**
     * @var \Symfony\Bundle\FrameworkBundle\Client
     */
    protected $client;

    public static function assertRedirect($response, $location)
    {
        self::assertTrue($response->isRedirect(), 'Response should be a redirect, got status code: '.substr($response, 0, 2000));
        self::assertEquals('http://localhost' . $location, $response->headers->get('Location'));
    }

    protected function setUp()
    {
        $this->client = self::createClient();

        if (!class_exists('Twig_Environment')) {
            $this->markTestSkipped('Twig is not available.');
        }

        if (null === $this->em) {
            $this->em = $this->client->getContainer()->get('doctrine')->getManager();

            if (static::$schemaSetUp === false) {
                $st = new SchemaTool($this->em);

                $classes = $this->em->getMetadataFactory()->getAllMetadata();
                $st->dropSchema($classes);
                $st->createSchema($classes);

                static::$schemaSetUp = true;
            }
        }

        $this->shareManager = $this->client->getContainer()->get('libbit_lox.share_manager');
        $this->groupManager = $this->client->getContainer()->get('fos_user.group_manager');

        $this->fixtureSetup();

        parent::setUp();
    }

    protected function fixtureSetup()
    {
        // Create a group
        $users = array();
        $group = $this->em->getRepository('Rednose\FrameworkBundle\Entity\Group')->findOneByName('Primary group');

        if ($group === null) {
            $groupPri = new Group('Primary group', array('ROLE_USER'));
            $groupSec = new Group('Secondary group', array('ROLE_USER'));

            $this->groupManager->updateGroup($groupPri, true);
            $this->groupManager->updateGroup($groupSec, true);
        }

        // Create some users
        for ($i = 1; $i < 4; $i++) {
            $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test' . $i);

            if ($user === null) {
                $userUtil = $this->client->getContainer()->get('fos_user.util.user_manipulator');
                $user = $userUtil->create('test' . $i, 'testpasswd' . $i, 'test' . $i . '@libbit.eu', true, false);
                $user->setRealname('Test user ' . $i);

                if ($i === 1) {
                    $user->addGroup($groupPri);
                }

                if ($i > 1) {
                    $user->addGroup($groupSec);
                }
            }

            $users[] = $user;
            $this->em->persist($user);
        }

        $this->em->flush();

        // Create some items to work with
        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test1');

        $items = array(
            'test-dir',
            'test-meta-dir',
            'test-meta.txt',
            'test-link.txt',
            'shared-dir',
            'shared-dir-user2',
            'encrypted-dir',
            'existing-dir'
        );

        foreach ($items as $itemName) {
            $owner = strpos($itemName, 'shared-dir-user2') === false ? $users[0] : $users[1];

            if ($this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneBy(array('owner' => $owner, 'title' => $itemName)) === null) {
                $root = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByOwner($owner);

                $item = new Item();
                $item->setTitle($itemName);
                $item->setIsDir(strpos($itemName, '.') === false);
                $item->setOwner($owner);
                $item->setParent($root);

                $this->em->persist($item);
            }
        }

        $this->em->flush();

        // Create an OAuth token
        if ($this->em->getRepository('Rednose\FrameworkBundle\Entity\Client')->findOneByName('Test token') === null) {
            $clientManager = $this->client->getContainer()->get('fos_oauth_server.client_manager.default');
            $client = $clientManager->createClient();
            $client->setName('Test token');

            $this->em->persist($client);
            $this->em->flush();
        }

        $this->client = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'test1',
            'PHP_AUTH_PW'   => 'testpasswd1',
        ));
    }

    protected function getRoute($name, $variables = array())
    {
        return $this->client->getContainer()->get('router')->generate($name, $variables, false);
    }

    protected function doLogin($name, $password)
    {
        $crawler = $this->client->request('GET', '/login');
        $form = $crawler->selectButton('_submit')->form(array(
            '_username'  => $name,
            '_password'  => $password,
        ));
        $this->client->submit($form);

        $this->token = $this->client->getContainer()->get('form.csrf_provider')->generateCsrfToken('web');

        $this->assertTrue($this->client->getResponse()->isRedirect());
        $this->assertNotEquals("", $this->token);
    }
}
