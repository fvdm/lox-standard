<?php

namespace Libbit\LoxBundle\Tests\Functional;

/**
 * Test interaction with shared folders
 */
class ApiShareOperationsTest extends WebTestCase
{
    /**
     * @var \Symfony\Bundle\FrameworkBundle\Client
     */
    protected $client;

    public function testCreateAndShareFolder()
    {
        // `test1` creates and shares `test-shared-dir` with `test2`.
        $test1 = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'test1',
            'PHP_AUTH_PW'   => 'testpasswd1',
        ));

        $test1->request('POST', '/lox_api/operations/delete', array('path' => 'test-shared-dir'));
        $test1->request('POST', '/lox_api/operations/delete', array('path' => 'renamed-source-dir'));

        $test1->request('POST', '/lox_api/operations/create_folder', array('path' => 'test-shared-dir'));

        $test1->request('GET', '/lox_api/identities/test2');
        $data = json_decode($test1->getResponse()->getContent(), true);

        $test1->request('POST', '/lox_api/share_create/test-shared-dir', array(), array(), array(), json_encode(array(
            'identities' => array(
                array(
                    'id' => $data[0]['id'],
                    'type' => 'user'
                )
            )
        )));

        // `test2` accepts.
        $test2 = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'test2',
            'PHP_AUTH_PW'   => 'testpasswd2',
        ));

        $test2->request('GET', '/lox_api/invitations');
        $data = json_decode($test2->getResponse()->getContent(), true);

        $test2->request('POST', '/lox_api/invite/'.$data[0]['id'].'/accept');
    }

    /**
     * @depends testCreateAndShareFolder
     */
    public function testRenamingShareSourceDoesRenameSource()
    {
        $test1 = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'test1',
            'PHP_AUTH_PW'   => 'testpasswd1',
        ));

        $test1->request('POST', '/lox_api/operations/move', array(
            'from_path' => '/test-shared-dir',
            'to_path'   => '/renamed-source-dir',
        ));

        $test1->request('GET', '/lox_api/meta/test-shared-dir');
        $this->assertEquals(404, $test1->getResponse()->getStatusCode());

        $test1->request('GET', '/lox_api/meta/renamed-source-dir');
        $this->assertEquals(200, $test1->getResponse()->getStatusCode());
    }

    /**
     * @depends testRenamingShareSourceDoesRenameSource
     */
    public function testRenamingShareSourceDoesNotRenameTarget()
    {
        $test2 = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'test2',
            'PHP_AUTH_PW'   => 'testpasswd2',
        ));

        $test2->request('GET', '/lox_api/meta/test-shared-dir');
        $this->assertEquals(200, $test2->getResponse()->getStatusCode());

        $test2->request('GET', '/lox_api/meta/renamed-source-dir');
        $this->assertEquals(404, $test2->getResponse()->getStatusCode());
    }

    /**
     * @depends testRenamingShareSourceDoesNotRenameTarget
     */
    public function testRenamingShareTargetDoesRenameTarget()
    {
        $test2 = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'test2',
            'PHP_AUTH_PW'   => 'testpasswd2',
        ));

        $test2->request('POST', '/lox_api/operations/move', array(
            'from_path' => '/test-shared-dir',
            'to_path'   => '/renamed-target-dir',
        ));

        $test2->request('GET', '/lox_api/meta/test-shared-dir');
        $this->assertEquals(404, $test2->getResponse()->getStatusCode());

        $test2->request('GET', '/lox_api/meta/renamed-target-dir');
        $this->assertEquals(200, $test2->getResponse()->getStatusCode());
    }

    /**
     * @depends testRenamingShareTargetDoesRenameTarget
     */
    public function testRenamingShareTargetDoesNotRenameSource()
    {
        $test1 = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'test1',
            'PHP_AUTH_PW'   => 'testpasswd1',
        ));

        $test1->request('GET', '/lox_api/meta/renamed-source-dir');
        $this->assertEquals(200, $test1->getResponse()->getStatusCode());

        $test1->request('GET', '/lox_api/meta/renamed-target-dir');
        $this->assertEquals(404, $test1->getResponse()->getStatusCode());
    }
}
