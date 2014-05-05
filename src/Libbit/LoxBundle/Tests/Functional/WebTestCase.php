<?php

namespace Libbit\LoxBundle\Tests\Functional;

use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase as BaseWebTestCase;

/**
 * Base Functional test case. Inspired (copied) from FrameworkBundle and SecurityBundle's
 * functional test suites.
 */
class WebTestCase extends BaseWebTestCase
{
    /**
     * @var \Doctrine\Common\Persistence\ObjectManager
     */
    protected $em;
    protected static $schemaSetUp = false;

    /**
     * @var \Symfony\Bundle\FrameworkBundle\Client
     */
    protected $client;

    public static function assertRedirect($response, $location)
    {
        self::assertTrue($response->isRedirect(), 'Response should be a redirect, got status code: '.substr($response, 0, 2000));
        self::assertEquals('http://localhost'.$location, $response->headers->get('Location'));
    }

    protected function setUp()
    {
        if (!class_exists('Twig_Environment')) {
            $this->markTestSkipped('Twig is not available.');
        }

        if (null === $this->em) {
            $this->em = $this->client->getContainer()->get('doctrine')->getManager();

            if (!static::$schemaSetUp) {
                $st = new SchemaTool($this->em);

                $classes = $this->em->getMetadataFactory()->getAllMetadata();
                //$st->dropSchema($classes);
                //$st->createSchema($classes);

                static::$schemaSetUp = true;
            }
        }

        parent::setUp();
    }
}
