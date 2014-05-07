<?php

namespace Libbit\LoxBundle\Tests\Functional;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Libbit\LoxBundle\Entity\Item;

class FileControllerTest extends WebTestCase
{
    /**
     * @var \Symfony\Bundle\FrameworkBundle\Client
     */
    protected $client;

    public function setUp()
    {
        parent::setUp();

        // Log in as user
        $this->doLogin('test1', 'testpasswd1');

        copy(__DIR__.'/Fixtures/test.txt', sys_get_temp_dir().'/test-item.txt');
        copy(__DIR__.'/Fixtures/test.pdf', sys_get_temp_dir().'/test-item.pdf');
        copy(__DIR__.'/Fixtures/test.txt', sys_get_temp_dir().'/existing-dir');
    }

    public function testGetFile404Code()
    {
        $this->client->request('GET', '/get/non-existent.txt?token='.$this->token);

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    public function testUploadFile200Code()
    {
        $file = new UploadedFile(
            sys_get_temp_dir().'/test-item.txt',
            'test-item.txt',
            'text/plain',
            strlen($this->getTestFileContent())
        );

        $this->client->request(
            'POST',
            '/upload',
            array('token' => $this->token, 'path' => '/'),
            array('file' => $file)
        );

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function testUploadFile200Code2()
    {
        $file = new UploadedFile(
            sys_get_temp_dir().'/test-item.pdf',
            'test-item.pdf',
            'application/pdf',
            strlen($this->getTestFileContent())
        );

        $this->client->request(
            'POST',
            '/upload',
            array('token' => $this->token, 'path' => '/'),
            array('file' => $file)
        );

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    public function testUploadFileOverwriteDirectory403Code()
    {
        $file = new UploadedFile(
            sys_get_temp_dir().'/existing-dir',
            'existing-dir',
            'text/plain',
            strlen($this->getTestFileContent3())
        );

        $this->client->request(
            'POST',
            '/upload',
            array('token' => $this->token, 'path' => '/'),
            array('file' => $file)
        );

        $this->assertEquals(403, $this->client->getResponse()->getStatusCode());
    }

    public function testPostFileToNonExistingPath404Code()
    {
        $file = new UploadedFile(
            sys_get_temp_dir().'/test-item.txt',
            'test-item.txt',
            'text/plain',
            strlen($this->getTestFileContent())
        );

        $this->client->request(
            'POST',
            '/upload',
            array('token' => $this->token, 'path' => '/non-existent-folder'),
            array('file' => $file)
        );

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testUploadFile200Code
     */
    public function testGetFile200Code()
    {
        $this->client->request('GET', '/get/test-item.txt?token='.$this->token);

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testUploadFile200Code
     */
    public function testGetFileReturnsFileContents()
    {
        $this->client->request('GET', '/get/test-item.txt?token='.$this->token);

        $this->assertEquals($this->getTestFileContent(), $this->client->getResponse()->getContent());
    }

    /**
     * @depends testUploadFile200Code2
     */
    public function testGetFileReturnsFileContents2()
    {
        $this->client->request('GET', '/get/test-item.pdf?token='.$this->token);

        $this->assertEquals($this->getTestFileContent2(), $this->client->getResponse()->getContent());
    }

    /**
     * @depends testUploadFile200Code
     */
    public function testGetFileSendsCorrectMimeType()
    {
        $this->client->request('GET', '/get/test-item.txt?token='.$this->token);

        $this->assertEquals('text/plain; charset=UTF-8', $this->client->getResponse()->headers->get('Content-Type'));
    }

    /**
     * @depends testUploadFile200Code2
     */
    public function testGetFileSendsCorrectMimeType2()
    {
        $this->client->request('GET', '/get/test-item.pdf?token='.$this->token);

        $this->assertEquals('application/pdf', $this->client->getResponse()->headers->get('Content-Type'));
    }

    /**
     * @depends testUploadFile200Code
     */
    public function testDefaultNoContentDisposition()
    {
        $this->client->request('GET', '/get/test-item.txt?token='.$this->token);

        $this->assertEquals(null, $this->client->getResponse()->headers->get('Content-Disposition'));
    }

    /**
     * @depends testUploadFile200Code
     */
    public function testDownloadFalseNoContentDisposition()
    {
        $this->client->request('GET', '/get/test-item.txt?download=0&token='.$this->token);

        $this->assertEquals(null, $this->client->getResponse()->headers->get('Content-Disposition'));
    }

    /**
     * @depends testUploadFile200Code
     */
    public function testDownloadTrueContentDisposition()
    {
        $this->client->request('GET', '/get/test-item.txt?download=1&token='.$this->token);

        $this->assertEquals('attachment; filename="test-item.txt"', $this->client->getResponse()->headers->get('Content-Disposition'));
    }

    /**
     * @depends testUploadFile200Code2
     */
    public function testDownloadTrueContentDisposition2()
    {
        $this->client->request('GET', '/get/test-item.pdf?download=1&token='.$this->token);

        $this->assertEquals('attachment; filename="test-item.pdf"', $this->client->getResponse()->headers->get('Content-Disposition'));
    }

    protected function getTestFileContent()
    {
        return file_get_contents(__DIR__.'/Fixtures/test.txt');
    }

    protected function getTestFileContent2()
    {
        return file_get_contents(__DIR__.'/Fixtures/test.pdf');
    }

    protected function getTestFileContent3()
    {
        return file_get_contents(__DIR__.'/Fixtures/test.txt');
    }
}
