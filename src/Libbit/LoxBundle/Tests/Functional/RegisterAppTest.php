<?php

namespace Libbit\LoxBundle\Tests\Functional;

class RegisterAppTest extends WebTestCase
{
    /**
     * @var \Symfony\Bundle\FrameworkBundle\Client
     */
    protected $client;

    public function setUp()
    {
        parent::setUp();

        // Log in as user
        $this->doLogin('test1', 'testpasswd1');
    }

    public function testRegisterApp()
    {
        $this->client->request('GET', '/register_app');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals('test1', $data['User']);
        $this->assertEquals('Test token', $data['APIKeys'][0]['Name']);
    }
}
