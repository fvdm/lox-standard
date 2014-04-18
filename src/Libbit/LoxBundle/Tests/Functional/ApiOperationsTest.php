<?php

namespace Libbit\LoxBundle\Tests\Functional;

use Libbit\LoxBundle\Entity\Item;

class ApiOperationsTest extends WebTestCase
{
    /**
     * @var \Symfony\Bundle\FrameworkBundle\Client
     */
    protected $client;

    public function setUp()
    {
        $this->client = self::createClient();

        parent::setUp();

        if ($this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('user') === null) {
            $userUtil = $this->client->getContainer()->get('fos_user.util.user_manipulator');
            $user = $userUtil->create('user', 'userpasswd', 'user@rednose.nl', true, false);
            $user->setRealname('Demo user');
            $this->em->persist($user);

            $this->em->flush();

            $root = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByOwner($user);

            $dir = new Item;
            $dir->setTitle('test-dir');
            $dir->setIsDir(true);
            $dir->setOwner($user);
            $dir->setParent($root);

            $this->em->persist($dir);

            $dir = new Item;
            $dir->setTitle('test-meta-dir');
            $dir->setIsDir(true);
            $dir->setOwner($user);
            $dir->setParent($root);

            $this->em->persist($dir);

            $file = new Item;
            $file->setTitle('test-meta.txt');
            $file->setIsDir(false);
            $file->setOwner($user);
            $file->setParent($root);

            $this->em->persist($file);

            $this->em->flush();
        }

        $this->client = self::createClient(array(), array(
            'PHP_AUTH_USER' => 'user',
            'PHP_AUTH_PW'   => 'userpasswd',
        ));
    }

    public function testPostFile201Code()
    {
        $this->client->request('POST', '/lox_api/files/test.txt', array(), array(), array(), $this->getTestFileContent());

        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }

    // -- Copy -----------------------------------------------------------------

    /**
     * @depends testPostFile201Code
     */
    public function testCopyCopiesTheFile()
    {
        $this->client->request('POST', '/lox_api/operations/copy', array(
            'from_path' => '/test.txt',
            'to_path'   => '/test-dir/test.txt',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('GET', '/lox_api/files/test-dir/test.txt');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testCopyDoesntRemoveTheSource()
    {
        $this->client->request('POST', '/lox_api/operations/copy', array(
            'from_path' => '/test.txt',
            'to_path'   => '/test-dir/test.txt',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('GET', '/lox_api/files/test.txt');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testCopyToSourceFileIncrementsFilename()
    {
        $this->client->request('POST', '/lox_api/operations/copy', array(
            'from_path' => '/test.txt',
            'to_path'   => '/test.txt',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('GET', '/lox_api/files/test (1).txt');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testInvalidCopySourceReturns404()
    {
        $this->client->request('POST', '/lox_api/operations/copy', array(
            'from_path' => '/test-non-existent.txt',
            'to_path'   => '/test-dir/test.txt',
        ));

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testInvalidCopyTargetReturns404()
    {
        $this->client->request('POST', '/lox_api/operations/copy', array(
            'from_path' => '/test.txt',
            'to_path'   => '/test-dir-non-existent/test.txt',
        ));

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testOmittedCopySourceReturns400()
    {
        $this->client->request('POST', '/lox_api/operations/copy', array(
            'to_path' => '/test-dir/test.txt',
        ));

        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testOmittedCopyTargetReturns400()
    {
        $this->client->request('POST', '/lox_api/operations/copy', array(
            'from_path' => '/test.txt',
        ));

        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    // -- Create Folder --------------------------------------------------------

    /**
     * @depends testPostFile201Code
     */
    public function testCreateFolderCreatesFolder()
    {
        $this->client->request('POST', '/lox_api/operations/create_folder', array(
            'path' => '/new-folder',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('GET', '/lox_api/meta/new-folder');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testCreateFolderInvalidPathReturns403()
    {
        $this->client->request('POST', '/lox_api/operations/create_folder', array(
            'path' => '/existing-folder',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('POST', '/lox_api/operations/create_folder', array(
            'path' => '/existing-folder',
        ));

        $this->assertEquals(403, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testOmittedCreateFolderPathReturns400()
    {
        $this->client->request('POST', '/lox_api/operations/create_folder');

        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    // -- Delete ---------------------------------------------------------------

    /**
     * @depends testPostFile201Code
     */
    public function testDeleteRemovesFile()
    {
        $this->client->request('POST', '/lox_api/files/remove-me.txt', array(), array(), array(), $this->getTestFileContent());

        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());

        $this->client->request('POST', '/lox_api/operations/delete', array(
            'path' => '/remove-me.txt',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('GET', '/lox_api/meta/remove-me.txt');

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testDeleteRemovesFolder()
    {
        $this->client->request('POST', '/lox_api/operations/create_folder', array(
            'path' => '/remove-folder',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('GET', '/lox_api/meta/remove-folder');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('POST', '/lox_api/operations/delete', array(
            'path' => '/remove-folder',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('GET', '/lox_api/meta/remove-folder');

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testDeleteNonExistentPathReturns404()
    {
        $this->client->request('POST', '/lox_api/operations/delete', array(
            'path' => '/non-existent-folder',
        ));

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testOmittedDeletePathReturns400()
    {
        $this->client->request('POST', '/lox_api/operations/delete');

        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    // -- Move -----------------------------------------------------------------

    /**
     * @depends testPostFile201Code
     */
    public function testMoveMovesTheFile()
    {
        $this->client->request('POST', '/lox_api/operations/move', array(
            'from_path' => '/test.txt',
            'to_path'   => '/test-dir/test.txt',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('GET', '/lox_api/files/test-dir/test.txt');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testMoveRemovesTheSource()
    {
        $this->client->request('POST', '/lox_api/operations/copy', array(
            'from_path' => '/test-dir/test.txt',
            'to_path'   => '/test.txt',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $this->client->request('GET', '/lox_api/files/test.txt');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testMovingToExistingTargetIncrementsFilename()
    {
        // Copy
        $this->client->request('POST', '/lox_api/operations/copy', array(
            'from_path' => '/test.txt',
            'to_path'   => '/test-dir/move-test.txt',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        // Move
        $this->client->request('POST', '/lox_api/operations/copy', array(
            'from_path' => '/test.txt',
            'to_path'   => '/test-dir/move-test.txt',
        ));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        // Get
        $this->client->request('GET', '/lox_api/files/test-dir/move-test (1).txt');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testInvalidMoveSourceReturns404()
    {
        $this->client->request('POST', '/lox_api/operations/move', array(
            'from_path' => '/test-non-existent.txt',
            'to_path'   => '/test-dir/test.txt',
        ));

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testInvalidMoveTargetReturns404()
    {
        $this->client->request('POST', '/lox_api/operations/move', array(
            'from_path' => '/test.txt',
            'to_path'   => '/test-dir-non-existent/test.txt',
        ));

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testOmittedMoveSourceReturns400()
    {
        $this->client->request('POST', '/lox_api/operations/move', array(
            'to_path' => '/test-dir/test.txt',
        ));

        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testOmittedMoveTargetReturns404()
    {
        $this->client->request('POST', '/lox_api/operations/move', array(
            'from_path' => '/test.txt',
        ));

        $this->assertEquals(400, $this->client->getResponse()->getStatusCode());
    }

    // -- Protected Methods ----------------------------------------------------

    protected function getTestFileContent()
    {
        return file_get_contents(__DIR__.'/Fixtures/test.txt');
    }
}
