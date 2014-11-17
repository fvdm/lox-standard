<?php

namespace Libbit\LoxBundle\Tests\Functional;

class KeyControllerTest extends WebTestCase
{
    /**
     * Super secret text
     *
     * @var String
     */
    protected $testString = 'Please There’s a crazy man that’s creeping outside my door, I live on the corner of Grey Street and the end of the world';

    /**
     * Private key passphrase
     *
     * @var String
     */
    protected $passphrase = 'test';

    /**
     * The encryption key
     *
     * @var String
     */
    protected $key = '';

    /**
     * The initialization vector
     *
     * @var String
     */
    protected $iv = '';

    protected function setUp()
    {
        parent::setUp();

        if (!function_exists('openssl_public_encrypt')) {
            $this->markTestSkipped('OpenSSL not available, please install and/or enable php5-openssl');
        }

        if (!function_exists('mcrypt_encrypt')) {
            $this->markTestSkipped('Mcrypt not available, please install and/or enable php5-mcrypt');
        }

        // Seed the randomizer
        srand();

        // Create a random binary token string to base the encryption key on.
        // Uses the mt_rand() function to make sure there is sufficient entropy! (rnd() is insecure)
        $rndString = '';

        for ($i = 0; $i < 2048; $i++) {
            $rndString .= chr(mt_rand(1, 253));
        }

        // Get a 256bits key based on the generated binary
        $this->key = hash('SHA256', $rndString, true);

        // Create InitVector
        $size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);
        $this->iv = mcrypt_create_iv($size, MCRYPT_RAND);
    }

    public function testSetRSAEncyptedKeyForUser()
    {
        $rsaPublicKey = $this->getPublicKey();

        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test1');
        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneBy(array('owner' => $user, 'title' => 'encrypted-dir'));

        $key = '';

        openssl_public_encrypt($this->key, $key, $rsaPublicKey);

        $this->client->request(
            'POST',
            '/lox_api/key/' . $item->getTitle(),
            array(), array(), array(), json_encode(array(
                'key'      => base64_encode($key),
                'iv'       => base64_encode($this->iv),
                'username' => $user->getUsername()
            ))
        );

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        return array($this->iv, $key, $this->key);
    }

    /**
     * @depends testSetRSAEncyptedKeyForUser
     */
    public function testGetRSAEncyptedKeyForUser($keyPack)
    {
        $iv       = $keyPack[0];
        $key      = $keyPack[1];
        $keyPlain = $keyPack[2];

        $rsaPrivateKey = $this->getPrivateKey();

        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test1');
        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneBy(array('owner' => $user, 'title' => 'encrypted-dir'));

        $this->client->request(
            'GET',
            '/lox_api/key/' . $item->getTitle()
        );

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
        $this->assertEquals($iv, base64_decode($data['iv']));
        $this->assertEquals($key, base64_decode($data['key']));

        $decrypterPointer = openssl_get_privatekey($rsaPrivateKey, $this->passphrase);

        openssl_private_decrypt($key, $keyDecrypted, $decrypterPointer);

        $this->assertEquals(true, $item->hasKeys());
        $this->assertEquals($keyPlain, $keyDecrypted);
    }

    /**
     * @depends testGetRSAEncyptedKeyForUser
     */
    public function testRevokeKeyForUser()
    {
        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test1');
        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneBy(array('owner' => $user, 'title' => 'encrypted-dir'));

        $this->client->request(
            'POST',
            $this->getRoute('libbit_lox_api_revoke_key_path', array('path' => '/' . $item->getTitle())),
            array(), array(), array(), json_encode(array(
                'username' => 'test1'
            ))
        );

        $this->assertEquals(false, $item->hasKeys());
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function testEncryption()
    {
        $cipherText = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $this->key, $this->testString, MCRYPT_MODE_CBC, $this->iv);

        $this->assertNotEquals(0, strlen($cipherText));

        return array($cipherText, $this->key, $this->iv);
    }

    /**
     * @depends testEncryption
     */
    public function testDecryption($encrypted)
    {
        $cipherText = $encrypted[0];
        $key        = $encrypted[1];
        $iv         = $encrypted[2];

        $plainText = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $cipherText, MCRYPT_MODE_CBC, $iv);
        $plainText = rtrim($plainText); // Cut off the block padding (Warning: not binary safe)

        $this->assertEquals($plainText, $this->testString);
    }

    /**
     * @return string
     */
    protected function getPublicKey()
    {
        $publicKey = file_get_contents(__DIR__.'/Fixtures/public.pem');
        $publicKey = openssl_get_publickey($publicKey);

        return $publicKey;
    }

    /**
     * @return string
     */
    protected function getPrivateKey()
    {
        return file_get_contents(__DIR__.'/Fixtures/private.pem');
    }
}
