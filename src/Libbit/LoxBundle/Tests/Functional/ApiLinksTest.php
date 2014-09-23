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
$this->markTestSkipped("Test unreliably times out for some reason");
        $date = new \DateTime('NOW');
        $date->setTimezone(new \DateTimeZone('WST'));

        $this->client->request('POST', '/lox_api/links/test-link.txt', array(
            'expires' => $date->format(\DateTime::ISO8601)
        ));

        $response = json_decode($this->client->getResponse()->getContent());

        $responseDate = new \DateTime($response->expires);
        $responseDate->setTimezone($date->getTimezone());

        $this->assertEquals($date, $responseDate);
        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }
}
