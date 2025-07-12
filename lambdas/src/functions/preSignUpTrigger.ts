import { PreSignUpTriggerEvent } from 'aws-lambda';
import { UserRepository } from '../repositories/user';
import { v4 as uuidv4 } from 'uuid';

exports.handler = async (event: PreSignUpTriggerEvent) => {
  console.log('event', event);

  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  const userRepository = new UserRepository();

  await userRepository.createUser({
    id: uuidv4(),
    role: event.request.userAttributes['custom:role'] as 'runner' | 'organizer',
    email: event.request.userAttributes['custom:email'],
    firstName: event.request.userAttributes['custom:firstName'],
    lastName: event.request.userAttributes['custom:lastName'],
  });

  return event;
};
