<?php

namespace Libbit\LoxBundle\Tests\Functional;

class ShareControllerTest extends WebTestCase
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

        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test2');

        if ($user === null) {
            $userUtil = $this->client->getContainer()->get('fos_user.util.user_manipulator');
            $user = $userUtil->create('test2', 'test2passwd', 'test2@libbit.eu', true, false);
            $user->setRealname('Test user 2');
            $this->em->persist($user);

            $this->em->flush();
        }

        $this->client = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'test',
            'PHP_AUTH_PW'   => 'testpasswd',
        ));
    }
}
