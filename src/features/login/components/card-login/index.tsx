import { Button, Flex, Heading } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

import './card-login.css';

export const CardLogin = () => {
  const handleGoogleLogin = () => {
    // aqui entraria a lógica do firebase
    console.log('Login com Google');
  };

  return (
    <Flex direction="column" align="center" justify="center" className="card-login">
      <Flex direction="column" align="center" className="card-login-header">
        <Heading size="sm" className="login-title">
          Login
        </Heading>
        <p className="login-description">Acesse com sua conta Google</p>
      </Flex>
      <Flex direction="column" align="center" className="card-login-body">
        <Button onClick={handleGoogleLogin} className="google-button">
          <FcGoogle className="google-button-icon" />
          Entrar com Google
        </Button>
      </Flex>
    </Flex>
  );
};
