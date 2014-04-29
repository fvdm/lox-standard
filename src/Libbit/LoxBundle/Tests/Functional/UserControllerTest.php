<?php

namespace Libbit\LoxBundle\Tests\Functional;

class UserControllerTest extends WebTestCase
{
    /**
     * @var \Symfony\Bundle\FrameworkBundle\Client
     */
    protected $client;

    public function setUp()
    {
        $this->client = self::createClient();

        parent::setUp();

        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test');

        if ($user === null) {
            $userUtil = $this->client->getContainer()->get('fos_user.util.user_manipulator');
            $user = $userUtil->create('test', 'testpasswd', 'test@libbit.eu', true, false);
            $user->setRealname('Test user');
            $this->em->persist($user);

            $this->em->flush();
        }

        $this->client = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'test',
            'PHP_AUTH_PW'   => 'testpasswd',
        ));
    }

    /**
     * User name should always be returned, keys are optional.
     */
    public function testGetUserInfo()
    {
        $this->client->request('GET', '/lox_api/user');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->assertEquals('Test user', $data['name']);
    }

    /**
     * Posting without parameters should return 400.
     */
    public function testPostUserInfoBadRequest()
    {
        $this->client->request('POST', '/lox_api/user');

        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    public function testPostUserKeyPair()
    {
        $publicKey  = $this->getPublicKey();
        $privateKey = $this->getPrivateKey();

        $this->client->request('POST', '/lox_api/user', array(), array(), array(), json_encode(array(
            'public_key'  => $publicKey,
            'private_key' => $privateKey
        )));

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->assertEquals($publicKey, $data['public_key']);
        $this->assertEquals($privateKey, $data['private_key']);
    }

    /**
     * @depends testPostUserKeyPair
     */
    public function testGetUserKeyPair()
    {
        $publicKey  = $this->getPublicKey();
        $privateKey = $this->getPrivateKey();

        $this->client->request('GET', '/lox_api/user');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->assertEquals($publicKey, $data['public_key']);
        $this->assertEquals($privateKey, $data['private_key']);
    }

    public function testPostEmptyUserKeyPair()
    {
        $this->client->request('POST', '/lox_api/user', array(), array(), array(), json_encode(array(
            'public_key'  => null,
            'private_key' => null
        )));

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->assertFalse(array_key_exists('public_key', $data));
        $this->assertFalse(array_key_exists('private_key', $data));
    }

    public function testGetIdentities()
    {
        $this->client->request('GET', '/lox_api/identities');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals('Test user', $data[0]['title']);
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function testGetIdentitiesSearch()
    {
        $this->client->request('GET', '/lox_api/identities/tes');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals('Test user', $data[0]['title']);
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostEmptyUserKeyPair
     */
    public function testGetEmptyUserKeyPair()
    {
        $this->client->request('GET', '/lox_api/user');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->assertFalse(array_key_exists('public_key', $data));
        $this->assertFalse(array_key_exists('private_key', $data));
    }

    /**
     * @return string
     */
    protected function getPublicKey()
    {
        return file_get_contents(__DIR__.'/Fixtures/id_rsa.pub');
    }

    /**
     * @return string
     */
    protected function getPrivateKey()
    {
        return file_get_contents(__DIR__.'/Fixtures/id_rsa');
    }
}
