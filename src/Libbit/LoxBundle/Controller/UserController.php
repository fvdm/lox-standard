<?php

namespace Libbit\LoxBundle\Controller;

use Rednose\FrameworkBundle\Model\UserInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Rednose\FrameworkBundle\Entity\User;
use Symfony\Component\HttpFoundation\Response;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Libbit\LoxBundle\Entity\KeyPair;
use Symfony\Component\Security\Core\Encoder\EncoderFactoryInterface;
use FOS\RestBundle\Util\Codes;
use Rednose\FrameworkBundle\Entity\UserManager;

class UserController extends Controller
{
    // -- Web Methods ---------------------------------------------------------

    /**
     * @Route("/user/change-password", name="libbit_lox_user_change_password")
     * @Method({"POST"})
     */
    public function changePasswordAction()
    {
        $request = $this->getRequest();

        $current  = $request->request->get('current_password');
        $password = $request->request->get('new_password');

        $response = new Response();

        if (!$current || !$password) {
            $response->setStatusCode(Codes::HTTP_BAD_REQUEST);

            return $response;
        }

        $user = $this->getUser();

        /** @var EncoderFactoryInterface $encoderFactory */
        $encoderFactory = $this->get('security.encoder_factory');

        $encoder = $encoderFactory->getEncoder($user);

        if (!$encoder->isPasswordValid($user->getPassword(), $current, $user->getSalt())) {
            $response->setStatusCode(Codes::HTTP_FORBIDDEN);

            return $response;
        }

        /** @var UserManager $userManager */
        $userManager = $this->get('rednose_framework.user_manager');

        $user->setPlainPassword($password);
        $userManager->updateUser($user);

        return $response;
    }

    /**
     * @Route("/user/change-locale", name="libbit_lox_user_change_locale", )
     * @Method({"POST"})
     */
    public function changeLocaleAction()
    {
        $locale = $this->getRequest()->request->get('locale');

        $response = new Response();

        if (!$locale) {
            $response->setStatusCode(Codes::HTTP_BAD_REQUEST);

            return $response;
        }

        $user = $this->getUser();

        if ($user instanceof UserInterface) {
            /** @var UserManager $userManager */
            $userManager = $this->get('rednose_framework.user_manager');

            $user->setLocale($locale);
            $userManager->updateUser($user);
        }

        return $response;
    }

    // -- API Methods ----------------------------------------------------------

    /**
     * Returns info about the user.
     * <p><strong>Example JSON response</strong></p>
     * <pre>{
     *     "name": "Demo User",
     *     "public_key": "GYRBAC54vZVXjK...WvruVr/PX",
     *     "private_key": "iBEgIJGRSiUCYR...GMgEOjEFg"
     * }</pre>
     *
     * @Route("/lox_api/user", name="libbit_lox_api_get_user")
     * @Method({"GET"})
     *
     * @ApiDoc(
     *     section="User",
     *     description="Returns info about the user",
     *     statusCodes={
     *         200="Returned when successful."
     *     }
     * )
     */
    public function getUserAction()
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw new \RuntimeException();
        }

        $data = array(
            'name' => $user->getBestname()
        );

        $keyPair = $this->getKeyPair($user);

        if ($keyPair->getPublicKey()) {
            $data['public_key'] = $keyPair->getPublicKey();
        }

        if ($keyPair->getPrivateKey()) {
            $data['private_key'] = $keyPair->getPrivateKey();
        }

        return new JsonResponse($data);
    }

    /**
     * Returns users and groups
     *
     * @Route("/lox_api/identities/{query}", defaults={"query"=""}, name="libbit_lox_api_identities")
     *
     * @param $query Optional query string to find users and groups
     *
     * @Method({"GET"})
     *
     * @ApiDoc(
     *     section="User",
     *     statusCodes={
     *         200="Returned when successful."
     *     }
     * )
     */
    public function getIdentitiesAction($query)
    {
        if ($query) {
            $request = $this->get('request');
            $request->query->set('q', $query);
        }

        $identManager = $this->get('libbit_lox.identity_manager');

        return new JsonResponse(
            $identManager->getIdentities()
        );
    }

    /**
     * Returns a list of usernames in a group
     *
     * @Route("/lox_api/identities/group/{id}", name="libbit_lox_api_identities_group")
     *
     * @param $id The group id
     *
     * @Method({"GET"})
     *
     * @ApiDoc(
     *     section="User",
     *     statusCodes={
     *         200="Returned when successful."
     *     }
     * )
     */
    public function getIdentitiesGroupAction($id)
    {
        $buffer = array();

        // In case the $id parameter is set with group_<id>
        if (strpos($id, 'group_') !== false) {
            $id = (int)substr($id, strpos($id, '_') + 1);
        }

        $identManager = $this->get('libbit_lox.identity_manager');
        $users = $identManager->getUsersByGroup($id);

        foreach ($users as $user) {
            $buffer[] = array('id' => 'user_' . $user->getId(), 'username' => $user->getUsername());
        }

        return new JsonResponse($buffer);
    }

    /**
     * Updates the current user by posting a JSON object.
     * <p><strong>Example JSON request</strong></p>
     * <pre>{
     *     "public_key": "GYRBAC54vZVXjK...WvruVr/PX",
     *     "private_key": "iBEgIJGRSiUCYR...GMgEOjEFg"
     * }</pre>
     *
     *
     * @Route("/lox_api/user", name="libbit_lox_api_post_user")
     * @Method({"POST"})
     *
     * @ApiDoc(
     *     section="User",
     *     description="Updates the current user and returns the updated user object",
     *     statusCodes={
     *         200="Returned when successful.",
     *         400="Returned when the specified parameters are invalid."
     *     }
     * )
     */
    public function postUserAction()
    {
        $request = $this->getRequest();
        $user    = $this->getUser();

        $data = json_decode($request->getContent(), true);

        if ($data === null) {
            $response = new Response();

            $response->setstatuscode(400);
            $response->setContent(json_encode(array(
                'error' => 'No parameters specified.',
            )));

            return $response;
        }

        $em      = $this->getDoctrine()->getManager();
        $keyPair = $this->getKeyPair($user);

        if (array_key_exists('public_key', $data)) {
            $keyPair->setPublicKey($data['public_key']);
        }

        if (array_key_exists('private_key', $data)) {
            $keyPair->setPrivateKey($data['private_key']);
        }

        $em->persist($keyPair);
        $em->flush();

        return $this->getUserAction();
    }

    /**
     * Returns the key pair for a given user.
     *
     * @param User $user
     *
     * @return KeyPair
     */
    protected function getKeyPair(User $user)
    {
        $em = $this->getDoctrine()->getManager();

        $keyPair = $em->getRepository('Libbit\LoxBundle\Entity\KeyPair')->findOneBy(array('user' => $user));

        if ($keyPair) {
            return $keyPair;
        }

        $keyPair = new KeyPair();
        $keyPair->setUser($user);

        return $keyPair;
    }
}
