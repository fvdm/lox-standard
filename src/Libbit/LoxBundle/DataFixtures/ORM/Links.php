<?php

namespace Libbit\LoxBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class Links extends AbstractFixture implements OrderedFixtureInterface, ContainerAwareInterface
{
    public function setContainer(ContainerInterface $container = null)
    {
        $this->lm = $container->get('libbit_lox.link_manager');
    }

    public function load(ObjectManager $em)
    {
        $admin = $em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('admin');

        $this->lm->createLink($this->getReference('admin-test.txt'), $admin);
        $this->lm->createLink($this->getReference('admin-test.pdf'), $admin);
        $this->lm->createLink($this->getReference('admin-shared-test.txt'), $admin);
    }

    public function getOrder()
    {
        return 20;
    }
}
