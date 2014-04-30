<?php

namespace Libbit\LoxBundle\Tests\Functional;

use Libbit\LoxBundle\Entity\Item;

class KeyTest extends WebTestCase
{
    /**
     * Super secret text
     *
     * @var String
     */
    protected $testString = 'Please There’s a crazy man that’s creeping outside my door, I live on the corner of Grey Street and the end of the world';

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
        $this->client = self::createClient();

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
        $size = mcrypt_get_iv_size(MCRYPT_CAST_256, MCRYPT_MODE_CBC);
        $this->iv = mcrypt_create_iv($size, MCRYPT_RAND);

        // Create user
        if ($this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('user') === null) {
            $userUtil = $this->client->getContainer()->get('fos_user.util.user_manipulator');
            $user = $userUtil->create('user', 'userpasswd', 'user@rednose.nl', true, false);
            $user->setRealname('Demo user');
            $this->em->persist($user);
        }

        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('user');

        // Create directory (Item)
        if ($this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneBy(array('owner' => $user, 'title' => 'encrypted-dir')) === null) {
            $root = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByOwner($user);

            $dir = new Item;
            $dir->setTitle('encrypted-dir');
            $dir->setIsDir(true);
            $dir->setOwner($user);
            $dir->setParent($root);

            $this->em->persist($dir);
            $this->em->flush();
        }

        $this->client = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'user',
            'PHP_AUTH_PW'   => 'userpasswd'
        ));
    }

    public function testSetRSAEncyptedKeyForUser()
    {
        $rsaPublicKey = $this->getPublicKey();

        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('user');
        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneBy(array('owner' => $user, 'title' => 'encrypted-dir'));

        $key = '';

        openssl_public_encrypt($this->key, $key, $rsaPublicKey);

        $this->client->request(
            'POST',
            '/lox_api/key/' . $item->getTitle(),
            array(), array(), array(), json_encode(array(
                'key'  => base64_encode($key),
                'iv' => base64_encode($this->iv)
            ))
        );

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
        $plainText = rtrim($plainText); // Cut off the block padding

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
        return file_get_contents(__DIR__.'/Fixtures/id_rsa');
    }
}
