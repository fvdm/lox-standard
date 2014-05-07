<?php

namespace Libbit\LoxBundle\Tests\Functional;

use Libbit\LoxBundle\Entity\Item;

class ApiTest extends WebTestCase
{
    public function testGetMetaReturnsFile()
    {
        $this->client->request('GET', '/lox_api/meta/test-meta.txt');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function testGetMetaReturnsFolder()
    {
        $this->client->request('GET', '/lox_api/meta/test-meta-dir');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function testGetNonExistingMetaReturns404()
    {
        $this->client->request('GET', '/lox_api/meta/meta-non-existent.txt');

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    public function testGetMetaFolderReturnsHash()
    {
        $this->client->request('GET', '/lox_api/meta/test-meta-dir');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertTrue(isset($data['hash']));
    }

    public function testGetMetaFolderWithHasReturns304()
    {
        $this->client->request('GET', '/lox_api/meta/test-meta-dir');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertTrue(isset($data['hash']));

        $hash = $data['hash'];

        $this->client->request('GET', '/lox_api/meta/test-meta-dir?hash='.$hash);

        $this->assertEquals(304, $this->client->getResponse()->getStatusCode());
    }

    public function testGetMetaModifiedFolderWithHashReturnsFolder()
    {
        $this->client->request('GET', '/lox_api/meta/test-meta-dir');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertTrue(isset($data['hash']));

        $hash = $data['hash'];

        // Modify dir (add new file)
        $this->client->request('POST', '/lox_api/files/test-meta-dir/test.txt', array(), array(), array(), $this->getTestFileContent());

        $this->client->request('GET', '/lox_api/meta/test-meta-dir?hash='.$hash);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function testGetMetaModifiedFolderWithHashReturnsNewHash()
    {
        $this->client->request('GET', '/lox_api/meta/test-meta-dir');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertTrue(isset($data['hash']));

        $hash = $data['hash'];

        // Modify dir (add new file)
        $this->client->request('POST', '/lox_api/files/test-meta-dir/test2.txt', array(), array(), array(), $this->getTestFileContent());

        $this->client->request('GET', '/lox_api/meta/test-meta-dir?hash='.$hash);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertTrue(isset($data['hash']));

        $newHash = $data['hash'];

        $this->assertNotEquals($hash, $newHash);
    }

    public function testGetFile404Code()
    {
        $this->client->request('GET', '/lox_api/files/non-existent.txt');

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    public function testPostFile201Code()
    {
        $this->client->request('POST', '/lox_api/files/test.txt', array(), array(), array(), $this->getTestFileContent());

        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }

    public function testPostFile201Code2()
    {
        $this->client->request('POST', '/lox_api/files/test.pdf', array(), array(), array(), $this->getTestFileContent2());

        $this->assertEquals(201, $this->client->getResponse()->getStatusCode());
    }

    public function testPostFileToNonExistingPath404Code()
    {
        $this->client->request('POST', '/lox_api/files/non-existent-folder/test.txt', array(), array(), array(), $this->getTestFileContent());

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testGetFile200Code()
    {
        $this->client->request('GET', '/lox_api/files/test.txt');

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testGetFileReturnsFileContents()
    {
        $this->client->request('GET', '/lox_api/files/test.txt');

        $this->assertEquals($this->getTestFileContent(), $this->client->getResponse()->getContent());
    }

    /**
     * @depends testPostFile201Code2
     */
    public function testGetFileReturnsFileContents2()
    {
        $this->client->request('GET', '/lox_api/files/test.pdf');

        $this->assertEquals($this->getTestFileContent2(), $this->client->getResponse()->getContent());
    }

    /**
     * @depends testPostFile201Code
     */
    public function testGetFileSendsCorrectMimeType()
    {
        $this->client->request('GET', '/lox_api/files/test.txt');

        $this->assertEquals('text/plain; charset=UTF-8', $this->client->getResponse()->headers->get('Content-Type'));
    }

    /**
     * @depends testPostFile201Code2
     */
    public function testGetFileSendsCorrectMimeType2()
    {
        $this->client->request('GET', '/lox_api/files/test.pdf');

        $this->assertEquals('application/pdf', $this->client->getResponse()->headers->get('Content-Type'));
    }

    /**
     * @depends testPostFile201Code
     */
    public function testNoContentDisposition()
    {
        $this->client->request('GET', '/lox_api/files/test.txt');

        $this->assertEquals(null, $this->client->getResponse()->headers->get('Content-Disposition'));
    }

    // -- Protected Methods ----------------------------------------------------

    protected function getTestFileContent()
    {
        return file_get_contents(__DIR__.'/Fixtures/test.txt');
    }

    protected function getTestFileContent2()
    {
        return file_get_contents(__DIR__.'/Fixtures/test.pdf');
    }
}
