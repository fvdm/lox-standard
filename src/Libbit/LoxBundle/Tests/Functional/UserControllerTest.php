<?php

namespace Libbit\LoxBundle\Tests\Functional;

class UserControllerTest extends WebTestCase
{
    public function testChangePasswordBadRequest()
    {
        $this->doLogin('test1', 'testpasswd1');

        $this->client->request('POST', '/user/change-password');

        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    public function testChangePasswordWrongPassword()
    {
        $this->doLogin('test1', 'testpasswd1');

        $this->client->request('POST', '/user/change-password', array(
            'current_password'  => 'wrongpasswd1',
            'new_password'      => 'testpasswd2'
        ));

        $this->assertEquals(403, $this->client->getResponse()->getStatusCode());
    }

    public function testChangePassword()
    {
        $this->doLogin('test1', 'testpasswd1');

        $this->client->request('POST', '/user/change-password', array(
            'current_password'  => 'testpasswd1',
            'new_password'      => 'testpasswd2'
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function testChangeLocaleBadRequest()
    {
        $this->doLogin('test1', 'testpasswd1');

        $this->client->request('POST', '/user/change-locale');

        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    public function testChangeLocale()
    {
        $this->doLogin('test1', 'testpasswd1');

        $this->client->request('POST', '/user/change-locale', array(
            'locale' => 'nl'
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * User name should always be returned, keys are optional.
     */
    public function testGetUserInfo()
    {
        $this->client->request('GET', '/lox_api/user');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->assertEquals('Test user 1', $data['name']);
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

    public function testGetIdentitiesGroup()
    {
        $group = $this->em->getRepository('Rednose\FrameworkBundle\Entity\Group')->findOneByName('Primary group');

        $this->client->request('GET', '/lox_api/identities/group/group_' . $group->getId());

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals('test1', $data[0]['username']);
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function testGetIdentities()
    {
        $user = false;
        $group = false;

        $this->client->request('GET', '/lox_api/identities');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        foreach ($data as $identity) {
            if ($identity['title'] === 'Test user 1') {
                $user = true;
            }

            if ($identity['title'] === 'Primary group') {
                $group = true;
            }
        }

        $this->assertEquals(true, $user);
        $this->assertEquals(true, $group);
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function testGetIdentitiesSearch()
    {
        $user = false;
        $group = false;

        // Test use[r] | Prima[r]y g[r]oup
        $this->client->request('GET', '/lox_api/identities/r');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        foreach ($data as $identity) {
            if ($identity['title'] === 'Test user 1') {
                $user = true;
            }

            if ($identity['title'] === 'Primary group') {
                $group = true;
            }
        }

        $this->assertEquals(true, $user);
        $this->assertEquals(true, $group);
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
        return base64_encode(file_get_contents(__DIR__.'/Fixtures/private.pem'));
    }

    /**
     * @return string
     */
    protected function getPrivateKey()
    {
        return base64_encode(file_get_contents(__DIR__.'/Fixtures/public.pem'));
    }
}
