<?php

namespace Libbit\LoxBundle\Tests\Functional;

class RegisterAppTest extends WebTestCase
{
    /**
     * @var \Symfony\Bundle\FrameworkBundle\Client
     */
    protected $client;

    protected $token;

    public function setUp()
    {
        $this->client = self::createClient();

        parent::setUp();

        if ($this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('user') === null) {
            $userUtil = $this->client->getContainer()->get('fos_user.util.user_manipulator');
            $user = $userUtil->create('user', 'userpasswd', 'user@rednose.nl', true, false);
            $user->setRealname('Demo user');
            $this->em->persist($user);
        }

        // Create a OAuth token
        $clientManager = $this->client->getContainer()->get('fos_oauth_server.client_manager.default');
        $client = $clientManager->createClient();
        $client->setName('Test Token');
        $this->em->persist($client);

        $this->em->flush();

        // Log in as user
        $this->doLogin('user', 'userpasswd');
    }

    public function doLogin($name, $password)
    {
        $crawler = $this->client->request('GET', '/login');
        $form = $crawler->selectButton('_submit')->form(array(
            '_username'  => $name,
            '_password'  => $password,
        ));
        $this->client->submit($form);
        $this->assertTrue($this->client->getResponse()->isRedirect());
    }

    public function testRegisterApp()
    {
        $this->client->request('GET', '/register_app');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals('user', $data['User']);
        $this->assertEquals('Test Token', $data['APIKeys'][0]['Name']);
    }
}
