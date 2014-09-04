<?php

namespace Libbit\LoxBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class Settings extends AbstractFixture implements OrderedFixtureInterface, ContainerAwareInterface
{
    public function setContainer(ContainerInterface $container = null)
    {
    }

    public function load(ObjectManager $em)
    {
        /** @var Connection $connection */
        $connection = $this->container->get('database_connection');
        $connection->exec("INSERT INTO libbit_lox_settings VALUES ('LocalBox', 'bundles/libbitlox/logo/whitebox.png', '#1B1B1B', '#999999')");
    }

    public function getOrder()
    {
        return 10;
    }
}
