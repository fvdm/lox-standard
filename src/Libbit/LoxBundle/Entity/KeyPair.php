<?php

namespace Libbit\LoxBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Rednose\FrameworkBundle\Entity\User;

/**
 * @ORM\Entity()
 * @ORM\Table(name="libbit_lox_key_pair")
 */
class KeyPair
{
    /**
     * @var integer
     *
     * @ORM\Id
     * @Assert\Regex("/[0-9]+/")
     * @ORM\Column(type="integer", name="id")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @var User
     * @ORM\ManyToOne(targetEntity="Rednose\FrameworkBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE")
     */
    protected $user;

    /**
     * @var string
     *
     * @Assert\Regex("/[a-zA-Z0-9\/+]+={0-2}/")
     * @ORM\Column(type="text", name="public_key", nullable=true)
     */
    protected $publicKey;

    /**
     * @var string
     * @Assert\Regex("/[a-zA-Z0-9\/+]+={0-2}/")
     *
     * @ORM\Column(type="text", name="private_key", nullable=true)
     */
    protected $privateKey;

    /**
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param string $privateKey
     */
    public function setPrivateKey($privateKey)
    {
        $this->privateKey = $privateKey;
    }

    /**
     * @return string
     */
    public function getPrivateKey()
    {
        return $this->privateKey;
    }

    /**
     * @param string $publicKey
     */
    public function setPublicKey($publicKey)
    {
        $this->publicKey = $publicKey;
    }

    /**
     * @return string
     */
    public function getPublicKey()
    {
        return $this->publicKey;
    }

    /**
     * @param User $user
     */
    public function setUser(User $user)
    {
        $this->user = $user;
    }

    /**
     * @return User
     */
    public function getUser()
    {
        return $this->user;
    }
}
