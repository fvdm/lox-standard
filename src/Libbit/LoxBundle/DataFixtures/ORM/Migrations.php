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

        try {
            $connection->exec('DELETE FROM `migration_versions`');
        } catch (\Exception $e) {
            // There is no migrations table yet.
            $connection->exec(
                'CREATE TABLE IF NOT EXISTS `migration_versions` (' .
                '`version` varchar(255) NOT NULL,' .
                'PRIMARY KEY (`version`)' .
                ');'
            );
        }

        $connection->exec('INSERT INTO `migration_versions` (`version`) VALUES ("20140331134636")');
        $connection->exec('INSERT INTO `migration_versions` (`version`) VALUES ("20140512142339")');
        $connection->exec('INSERT INTO `migration_versions` (`version`) VALUES ("20140512210404")');
        $connection->exec('INSERT INTO `migration_versions` (`version`) VALUES ("Version20140828144301")');
    }

    public function getOrder()
    {
        return 100;
    }
}
