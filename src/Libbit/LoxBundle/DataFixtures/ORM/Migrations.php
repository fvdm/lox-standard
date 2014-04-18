<?php

namespace Libbit\LoxBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\DBAL\Connection;

class Migrations extends AbstractFixture implements OrderedFixtureInterface, ContainerAwareInterface
{
    /**
     * @var ContainerInterface
     */
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function load(ObjectManager $em)
    {
        /** @var Connection $connection */
        $connection = $this->container->get('database_connection');

        $connection->exec('INSERT INTO `migration_versions` (`version`) VALUES ("20140331134636")');
    }

    public function getOrder()
    {
        return 100;
    }
}
