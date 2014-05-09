<?php

namespace Libbit\LoxBundle\Tests\Functional;

use Symfony\Component\HttpFoundation\File\UploadedFile;

class ShareControllerTest extends WebTestCase
{
    public function setUp()
    {
        parent::setUp();

        copy(__DIR__.'/Fixtures/test.txt', sys_get_temp_dir().'/test-item.txt');
    }

    public function testCreateShare()
    {
        $route = $this->getRoute('libbit_lox_api_shares_new', array('path' => '/shared-dir'));

        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test2');

        $settings = array(
            'identities' => array(
                array('id' => 'user_' . $user->getId(), 'type' => 'user')
            )
        );

        $this->client->request(
            'POST',
            $route,
            array(), array(), array(), json_encode($settings)
        );

        $this->acceptInvitations($user);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        return $settings;
    }

    /**
     * @depends testCreateShare
     */
    public function testUpdateShare($settings)
    {
        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test3');
        $group = $this->em->getRepository('Rednose\FrameworkBundle\Entity\Group')->findOneByName('Secondary group');
        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByTitle('shared-dir');

        $share = $item->getShare();
        $route = $this->getRoute('libbit_lox_api_shares_edit', array('id' => $share->getId()));

        $settings['identities'][] = array('id' => 'group_' . $group->getId(), 'type' => 'group');

        $this->client->request(
            'POST',
            $route,
            array(), array(), array(), json_encode($settings)
        );

        $this->acceptInvitations($user);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        return $settings;
    }

    /**
     * @depends testUpdateShare
     */
    public function testGetShareSettings($settings)
    {
        $user = false;
        $group = false;

        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByTitle('shared-dir');

        $route = $this->getRoute('libbit_lox_api_shares_get', array('path' => $item->getTitle()));

        $this->client->request('GET', $route);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $data = $data['identities'];

        foreach ($data as $identity) {
            foreach ($settings['identities'] as $setting) {
                if ($setting['type'] === 'user' && $setting['id'] === $identity['id']) {
                    $user = true;
                }

                if ($setting['type'] === 'group' && $setting['id'] === $identity['id']) {
                    $group = true;
                }
            }
        }

        $this->assertEquals(true, $user);
        $this->assertEquals(true, $group);
    }

    // -- Test access to shared folders ----------------------------------------

    /**
     * @depends testUpdateShare
     */
    public function testUploadFileToJoinedShare()
    {
        $this->doLogin('test3', 'testpasswd3');

        // User3 accepted invited to `shared-dir` at this point.
        $this->client->request('GET', '/meta/shared-dir');

        $file = new UploadedFile(
            sys_get_temp_dir().'/test-item.txt',
            'test-item.txt',
            'text/plain',
            strlen($this->getTestFileContent())
        );

        $this->client->request(
            'POST',
            '/upload',
            array('token' => $this->token, 'path' => '/shared-dir'),
            array('file' => $file)
        );

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testUploadFileToJoinedShare
     */
    public function testListJoinedShareAfterUpload()
    {
        $this->doLogin('test3', 'testpasswd3');

        $this->client->request('GET', '/meta/shared-dir');

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertCount(1, $data['children']);
    }

    /**
     * @depends testListJoinedShareAfterUpload
     */
    public function testGetFileUploadedToJoinedShare()
    {
        $this->doLogin('test3', 'testpasswd3');

        $this->client->request('GET', '/get/shared-dir/test-item.txt');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testGetFileUploadedToJoinedShare
     */
    public function testLeaveSharedFolder()
    {
        $this->doLogin('test3', 'testpasswd3');

        $this->client->request('POST', '/shares/shared-dir/leave');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testLeaveSharedFolder
     */
    public function testLeaveSharedFolderRemovesTheShare()
    {
        $this->doLogin('test3', 'testpasswd3');

        $this->client->request('GET', '/meta/shared-dir');

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    protected function acceptInvitations($user)
    {
        $invitations = $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findByReceiver($user);

        foreach ($invitations as $invite) {
            $this->shareManager->acceptInvitation($invite);
        }
    }

    protected function getTestFileContent()
    {
        return file_get_contents(__DIR__.'/Fixtures/test.txt');
    }
}

