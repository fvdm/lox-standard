<?php

return array(
    new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
    new Symfony\Bundle\SecurityBundle\SecurityBundle(),
    new Symfony\Bundle\TwigBundle\TwigBundle(),
    new Symfony\Bundle\MonologBundle\MonologBundle(),
    new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
    new Symfony\Bundle\AsseticBundle\AsseticBundle(),
    new Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
    new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),
    new JMS\AopBundle\JMSAopBundle(),
    new JMS\DiExtraBundle\JMSDiExtraBundle($this),
    new JMS\SecurityExtraBundle\JMSSecurityExtraBundle(),

    // Rednose Framework dependencies.
    new \Knp\Bundle\MenuBundle\KnpMenuBundle(),
    new \Sonata\DoctrineORMAdminBundle\SonataDoctrineORMAdminBundle(),
    new \Sonata\AdminBundle\SonataAdminBundle(),

    new JMS\SerializerBundle\JMSSerializerBundle($this),
    new FOS\UserBundle\FOSUserBundle(),
    new Doctrine\Bundle\FixturesBundle\DoctrineFixturesBundle(),
    new FOS\RestBundle\FOSRestBundle(),
    new Nelmio\ApiDocBundle\NelmioApiDocBundle(),
    new Sonata\NotificationBundle\SonataNotificationBundle(),
    new FOS\OAuthServerBundle\FOSOAuthServerBundle(),
    new Knp\Bundle\TimeBundle\KnpTimeBundle(),

    new Knp\Bundle\GaufretteBundle\KnpGaufretteBundle(),
    new Vich\UploaderBundle\VichUploaderBundle(),
    new RMS\PushNotificationsBundle\RMSPushNotificationsBundle(),

    new Rednose\FrameworkBundle\RednoseFrameworkBundle(),
    new Rednose\CdnBundle\RednoseCdnBundle(),
    new Rednose\YuiBundle\RednoseYuiBundle(),

    new Libbit\LoxBundle\RednoseLoxBundle(),
);
