<?php

namespace Libbit\LoxBundle\Tests\Functional;

class InvitationControllerTest extends WebTestCase
{
    public function testInventations()
    {
        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test1');
        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByTitle('shared-dir-user2');

        $this->shareManager->createShare($item, array(), array($user));

        $this->client->request('GET', $this->getRoute('libbit_lox_api_invitations'));

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $invite = $data[0];

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
        $this->assertEquals('pending', $invite['state']);
        $this->assertEquals('shared-dir-user2', $invite['share']['item']['title']);

        return $invite['id'];
    }

    public function testInventationAcceptNotFound()
    {
        $this->client->request('POST', $this->getRoute('libbit_lox_api_invitation_accept', array('id' => 0)));

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testInventations
     */
    public function testInventationAccept($inviteId)
    {
        $this->client->request('POST', $this->getRoute('libbit_lox_api_invitation_accept', array('id' => $inviteId)));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        return $inviteId;
    }

    /**
     * @depends testInventationAccept
     */
    public function testInventationRevoke($inviteId)
    {
        $this->client->request('POST', $this->getRoute('libbit_lox_api_invitation_revoke', array('id' => $inviteId)));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }
}
