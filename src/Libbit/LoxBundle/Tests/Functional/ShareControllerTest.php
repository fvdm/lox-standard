<?php

namespace Libbit\LoxBundle\Tests\Functional;

class ShareControllerTest extends WebTestCase
{
    public function testCreateShare()
    {
        $route = $this->getRoute('libbit_lox_api_shares_new', array('path' => '/shared-dir'));

        $user = $this->em->getRepository('Rednose\FrameworkBundle\Entity\User')->findOneByUsername('test2');
        $item = $this->em->getRepository('Libbit\LoxBundle\Entity\Item')->findOneByTitle('shared-dir');

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

    protected function acceptInvitations($user)
    {
        $invitations = $this->em->getRepository('Libbit\LoxBundle\Entity\Invitation')->findByReceiver($user);

        foreach ($invitations as $invite) {
            $this->shareManager->acceptInvitation($invite);
        }
    }
}
