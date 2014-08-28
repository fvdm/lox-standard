<?php

namespace Libbit\LoxBundle\Tests\Functional;

class InvitationControllerTest extends WebTestCase
{
    public function testInvitations()
    {
        // Create share
        $this->doLogin('test2', 'testpasswd2');

        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test1');
        $route = $this->getRoute('libbit_lox_shares_new', array('path' => '/shared-dir-user2'));

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

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        // Test invitation
        $this->doLogin('test2', 'testpasswd2');

        $this->client->request('GET', $this->getRoute('libbit_lox_api_invitations'));

        $data = json_decode($this->client->getResponse()->getContent(), true);

        $invite = $data[0];

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
        $this->assertEquals('pending', $invite['state']);
        $this->assertEquals('shared-dir-user2', $invite['share']['item']['title']);

        return $invite['id'];
    }

    public function testInvitationAcceptNotFound()
    {
        $this->client->request('POST', $this->getRoute('libbit_lox_api_invitation_accept', array('id' => 0)));

        $this->assertEquals(404, $this->client->getResponse()->getStatusCode());
    }

    /**
     * @depends testInvitations
     */
    public function testInvitationAccept($inviteId)
    {
        $this->client->request('POST', $this->getRoute('libbit_lox_api_invitation_accept', array('id' => $inviteId)));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());

        return $inviteId;
    }

    /**
     * @depends testInvitationAccept
     */
    public function testInvitationRevoke($inviteId)
    {
        $this->client->request('POST', $this->getRoute('libbit_lox_api_invitation_revoke', array('id' => $inviteId)));

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
    }
}
