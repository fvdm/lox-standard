<?php

namespace Libbit\LoxBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

use Libbit\LoxBundle\Entity\Settings as SettingsEntity;

class Settings extends AbstractFixture implements OrderedFixtureInterface
{
    public function load(ObjectManager $em)
    {
        $settings = new SettingsEntity();

        $em->persist($settings);
        $em->flush();
    }

    public function getOrder()
    {
        return 10;
    }
}
