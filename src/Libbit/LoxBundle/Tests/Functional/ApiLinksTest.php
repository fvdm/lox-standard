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

        // Weird timezone for testing purposes
        $date->setTimeZone(new \DateTimeZone("CST"));

        $this->client->request('POST', '/lox_api/links/test-link.txt', array(
            'expires' => $date->format(\DateTime::ISO8601)
        ));

        $response = json_decode($this->client->getResponse()->getContent());
        $responseDate = new \DateTime($response->expires);

        $this->assertEquals($date, $responseDate);

        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }
}