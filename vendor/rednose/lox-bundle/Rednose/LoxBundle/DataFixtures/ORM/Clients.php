<?php

namespace Rednose\LoxBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class Clients extends AbstractFixture implements OrderedFixtureInterface, ContainerAwareInterface
{
    public function setContainer(ContainerInterface $container = null)
    {
        $this->cm = $container->get('fos_oauth_server.client_manager.default');
    }

    public function load(ObjectManager $em)
    {
        $client = $this->cm->createClient();

        $client->setName('LocalBox iOS');

        $client->setRedirectUris(array('http://www.rednose.nl'));
        $client->setAllowedGrantTypes(array('token', 'authorization_code', 'password', 'refresh_token'));

        $client->setRandomId('32yqjbq9u38koggk040w408cccss8og4c0ckso4sgoocwgkkoc');
        $client->setSecret('4j8jqubjrbi8wwsk0ocowooggkc44wcw0044skgscg4o4o44s4');

        $this->cm->updateClient($client);
    }

    public function getOrder()
    {
        return 10;
    }
}
