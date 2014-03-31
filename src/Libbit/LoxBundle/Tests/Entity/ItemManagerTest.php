<?php

namespace Libbit\LoxBundle\Tests\Entity;

use Libbit\LoxBundle\Entity\ItemManager;
use Libbit\LoxBundle\Entity\Item;
use Rednose\FrameworkBundle\Entity\User;

class ItemManagerTest extends \PHPUnit_Framework_TestCase
{
    protected $em;

    public function setUp()
    {
        if (!class_exists('Doctrine\\ORM\\EntityManager')) {
            $this->markTestSkipped('Doctrine ORM not installed');
        }

        $this->em = $this->getMockBuilder('Doctrine\ORM\EntityManager')
            ->disableOriginalConstructor()
            ->getMock();
        $this->repository = $this->getMockBuilder('Doctrine\ORM\EntityRepository')
            ->disableOriginalConstructor()
            ->getMock();
        $this->class = 'Libbit\LoxBundle\Entity\Item';

        $this->em->expects($this->any())
            ->method('getRepository')
            ->will($this->returnValue($this->repository));
    }

    public function testCreateItemReturnsNewItem()
    {
        $im = $this->getItemManager();

        $item = $im->createItem($this->getUser());

        $this->assertInstanceOf($this->class, $item);
    }

    public function testCreateFileItemReturnsFile()
    {
        $im = $this->getItemManager();

        $item = $im->createFileItem($this->getUser());

        $this->assertInstanceOf($this->class, $item);
        $this->assertFalse($item->getIsDir());
    }

    public function testCreateFolderItemReturnsFolder()
    {
        $im = $this->getItemManager();

        $item = $im->createFolderItem($this->getUser());

        $this->assertInstanceOf($this->class, $item);
        $this->assertTrue($item->getIsDir());
    }

    public function testMoveItemChangesParent()
    {
        $im = $this->getItemManager();

        $item   = $im->createFolderItem($this->getUser());
        $parent = $im->createFolderItem($this->getUser());

        $this->assertNull($item->getParent());

        $im->moveItem($item, $parent);

        $this->assertSame($parent, $item->getParent());
    }

    public function testMoveItemSetsTitle()
    {
        $im = $this->getItemManager();

        $item   = $im->createFolderItem($this->getUser());
        $parent = $im->createFolderItem($this->getUser());

        $item->setTitle('Old Title');

        $im->moveItem($item, $parent, 'New Title');

        $this->assertEquals('New Title', $item->getTitle());
    }

    public function testCopyItemCopiesItem()
    {
        $im = $this->getItemManager();

        $item   = $im->createFolderItem($this->getUser());
        $parent = $im->createFolderItem($this->getUser());

        $item->setTitle('Item title');

        $copy = $im->copyItem($item, $parent);

        $this->assertCopy($copy, $item);
    }

    public function testCopyItemSetsNewTitle()
    {
        $im = $this->getItemManager();

        $item   = $im->createFolderItem($this->getUser());
        $parent = $im->createFolderItem($this->getUser());

        $item->setTitle('Old Title');

        $copy = $im->copyItem($item, $parent, 'New Title');

        $this->assertEquals('Old Title', $item->getTitle());
        $this->assertEquals('New Title', $copy->getTitle());
    }

    /**
     * Tests recursive copying of the following tree structure:
     *
     * Root
     * |-- Folder 1
     * |    |-- Folder 2
     * |    |    |-- Folder 3
     * |    |    |    |-- File 3
     * |    |    |-- File 2
     * |    |-- File 1
     */
    public function testCopyItemRecursivelyCopiesChildren()
    {
        // Arrange
        $im = $this->getItemManager();

        $root = $im->createFolderItem($this->getUser());
        $root->setTitle('Root');

        $folder1 = $im->createFolderItem($this->getUser());
        $folder1->setTitle('Folder 1');
        $root->addChild($folder1);

        $folder2 = $im->createFolderItem($this->getUser());
        $folder2->setTitle('Folder 2');
        $folder1->addChild($folder2);

        $folder3 = $im->createFileItem($this->getUser());
        $folder3->setTitle('Folder 3');
        $folder2->addChild($folder3);

        $file1 = $im->createFileItem($this->getUser());
        $file1->setTitle('File 1');
        $folder1->addChild($file1);

        $file2 = $im->createFileItem($this->getUser());
        $file2->setParent($folder2);
        $file2->setTitle('File 2');
        $folder2->addChild($file2);

        $file3 = $im->createFileItem($this->getUser());
        $file3->setTitle('File 3');
        $folder3->addChild($file3);

        // Act
        $copyFolder1 = $im->copyItem($folder1, $root, 'Folder 1 (1)');

        // Assert
        $copyFolder2 = $copyFolder1->getChildren()->get(0);
        $copyFile1   = $copyFolder1->getChildren()->get(1);
        $copyFolder3 = $copyFolder1->getChildren()->get(0)->getChildren()->get(0);
        $copyFile2   = $copyFolder1->getChildren()->get(0)->getChildren()->get(1);
        $copyFile3   = $copyFolder1->getChildren()->get(0)->getChildren()->get(0)->getChildren()->get(0);

        $this->assertCopy($copyFolder1, $folder1);

        $this->assertCopy($copyFolder2, $folder2);
        $this->assertCopy($copyFile1,   $file1);
        $this->assertCopy($copyFolder3, $folder3);
        $this->assertCopy($copyFile2,   $file2);
        $this->assertCopy($copyFile3,   $file3);
    }

    protected function assertCopy($copy, $item)
    {
        $this->assertInstanceOf($this->class, $copy);
        $this->assertNotSame($item, $copy);
        $this->assertEquals($item->getIsDir(), $copy->getIsDir());
        $this->assertSame($item->getOwner(), $copy->getOwner());
    }

    protected function getItemManager()
    {
        return $this->getMock('Libbit\LoxBundle\Entity\ItemManager', array('getRootItem', 'saveItem'), array($this->em));
    }

    protected function getUser()
    {
    	return new User;
    }
}
