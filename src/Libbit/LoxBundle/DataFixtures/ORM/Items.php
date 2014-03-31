<?php

namespace Libbit\LoxBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Libbit\LoxBundle\Entity\Item;
use Libbit\LoxBundle\Entity\Revision;

class Items extends AbstractFixture implements OrderedFixtureInterface, ContainerAwareInterface
{
    public function setContainer(ContainerInterface $container = null)
    {
        $this->kernel  = $container->get('kernel');
        $this->im      = $container->get('libbit_lox.item_manager');
        $this->sm      = $container->get('libbit_lox.share_manager');
        $this->namer   = $container->get('vich_uploader.namer_uniqid');
        $this->dataDir = $this->kernel->getRootDir() . '/../data';
    }

    public function load(ObjectManager $em)
    {
        $files = glob($this->dataDir.'/*');

        foreach($files as $file){
            if(is_file($file)) {
                unlink($file);
            }
        }

        // Admin
        $admin = $em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('admin');

        $root = $em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByOwner($admin);

        $adminRoot = $root;

        $dir1 = new Item;
        $dir1->setTitle('Folder 1');
        $dir1->setIsDir(true);
        $dir1->setParent($root);
        $dir1->setOwner($admin);
        $em->persist($dir1);

        $dir2 = new Item;
        $dir2->setTitle('Folder 2');
        $dir2->setParent($dir1);
        $dir2->setIsDir(true);
        $dir2->setOwner($admin);
        $em->persist($dir2);

        $dir3 = new Item;
        $dir3->setTitle('Folder 3');
        $dir3->setParent($dir2);
        $dir3->setIsDir(true);
        $dir3->setOwner($admin);
        $em->persist($dir3);

        $dir4 = new Item;
        $dir4->setTitle('Folder 4');
        $dir4->setParent($root);
        $dir4->setIsDir(true);
        $dir4->setOwner($admin);
        $em->persist($dir4);

        $dir5 = new Item;
        $dir5->setTitle('Folder 5');
        $dir5->setParent($root);
        $dir5->setIsDir(true);
        $dir5->setOwner($admin);
        $em->persist($dir5);

        $dir6 = new Item;
        $dir6->setTitle('Folder 6');
        $dir6->setParent($root);
        $dir6->setIsDir(true);
        $dir6->setOwner($admin);
        $em->persist($dir6);

        $dir7 = new Item;
        $dir7->setTitle('Folder 7');
        $dir7->setParent($dir3);
        $dir7->setIsDir(true);
        $dir7->setOwner($admin);
        $em->persist($dir7);

        $dir8 = new Item;
        $dir8->setTitle('Folder 8');
        $dir8->setParent($dir7);
        $dir8->setIsDir(true);
        $dir8->setOwner($admin);
        $em->persist($dir8);

        $file = new Item;
        $file->setTitle('test.txt');
        $file->setParent($dir3);
        $file->setIsDir(false);
        $file->setOwner($admin);
        $revision = new Revision();
        $revision->setUser($admin);
        $revision->setFile($this->getUploadedFile($this->kernel->locateResource('@RednoseLoxBundle/DataFixtures/ORM/files/test.txt')));
        $file->addRevision($revision);

        $this->addReference('admin-test.txt', $file);

        $em->persist($file);

        $file2 = new Item;
        $file2->setTitle('test.pdf');
        $file2->setParent($root);
        $file2->setIsDir(false);
        $file2->setOwner($admin);
        $revision = new Revision();
        $revision->setUser($admin);
        $revision->setFile($this->getUploadedFile($this->kernel->locateResource('@RednoseLoxBundle/DataFixtures/ORM/files/test.pdf')));
        $file2->addRevision($revision);
        $this->addReference('admin-test.pdf', $file2);

        $em->persist($file2);

        $em->flush();

        // User
        $user = $em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('user');
        $root = $em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByOwner($user);

        // Share Folder 5 with user
        $share = $this->sm->createShare($dir5, array(), array($user));

        $file = new Item;
        $file->setTitle('test.txt');
        $file->setParent($root);
        $file->setIsDir(false);
        $file->setOwner($user);
        $revision = new Revision();
        $revision->setUser($admin);
        $revision->setFile($this->getUploadedFile($this->kernel->locateResource('@RednoseLoxBundle/DataFixtures/ORM/files/test.txt')));
        $file->addRevision($revision);

        $em->persist($file);

        $dir1 = new Item;
        $dir1->setTitle('Folder 1');
        $dir1->setIsDir(true);
        $dir1->setParent($root);
        $dir1->setOwner($user);
        $em->persist($dir1);

        $dir2 = new Item;
        $dir2->setTitle('Folder 2');
        $dir2->setParent($dir1);
        $dir2->setIsDir(true);
        $dir2->setOwner($user);
        $em->persist($dir2);

        $dir3 = new Item;
        $dir3->setTitle('Folder 3');
        $dir3->setParent($dir2);
        $dir3->setIsDir(true);
        $dir3->setOwner($user);
        $em->persist($dir3);

        $file2 = new Item;
        $file2->setTitle('test.pdf');
        $file2->setParent($root);
        $file2->setIsDir(false);
        $revision = new Revision();
        $revision->setUser($admin);
        $revision->setFile($this->getUploadedFile($this->kernel->locateResource('@RednoseLoxBundle/DataFixtures/ORM/files/test.pdf')));
        $file2->addRevision($revision);
        $file2->setOwner($user);

        $em->persist($file2);

        $em->flush();

        // Shares
        $dir = new Item;
        $dir->setTitle('Demo user\'s shared folder');
        $dir->setParent($root);
        $dir->setIsDir(true);
        $dir->setOwner($user);
        $em->persist($dir);

        $file = new Item;
        $file->setTitle('test.txt');
        $file->setParent($dir);
        $file->setIsDir(false);
        $file->setOwner($user);
        $revision = new Revision();
        $revision->setUser($admin);
        $revision->setFile($this->getUploadedFile($this->kernel->locateResource('@RednoseLoxBundle/DataFixtures/ORM/files/test.txt')));
        $file->addRevision($revision);
        $this->addReference('admin-shared-test.txt', $file);

        $em->persist($file);

        $em->flush();

        $share = $this->sm->createShare($dir, array(), array($admin));

        $invite = $em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findOneByShare($share);

        $this->sm->acceptInvitation($invite);
    }

    public function getOrder()
    {
        return 10;
    }

    protected function getUploadedFile($path)
    {
        $file = new \SplFileInfo($path);

        // MacOSX version of sys_get_temp_dir() returns trailingslash
        if (sys_get_temp_dir()[strlen(sys_get_temp_dir()) - 1] === '/') {
            $dest = sys_get_temp_dir() . $file->getBaseName();
        } else {
            $dest = sys_get_temp_dir() . '/' . $file->getBaseName();
        }

        copy($path, $dest);

        return new UploadedFile($dest, $file->getBaseName(), null, null, null, true);
    }
}
