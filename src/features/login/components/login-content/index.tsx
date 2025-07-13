import { Flex, Heading } from '@chakra-ui/react';
import { CardLogin } from '../card-login';

import './login-content.css';

export const LoginContent = () => {
  return (
    <Flex justify="space-evenly" align="center" className="login-container">
      <Heading size="6xl" className="title-container-login">
        SGLM
      </Heading>
      <CardLogin />
    </Flex>
  );
};
