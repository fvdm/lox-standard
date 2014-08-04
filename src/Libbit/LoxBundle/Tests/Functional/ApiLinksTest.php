<?php

namespace Libbit\LoxBundle\Tests\Functional;

class ApiLinksTest extends WebTestCase
{
    /**
     * @var \Symfony\Bundle\FrameworkBundle\Client
     */
    protected $client;

    public function testGeneratePublicExpiredLinkReturnsJson()
    {
        $date = new \DateTime('NOW');

        $this->client->request('POST', '/lox_api/links/test-link.txt', array(
            'expires' => $date->format(\DateTime::ISO8601)
        ));

        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }
}