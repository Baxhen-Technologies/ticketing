import { FormEvent, useState } from 'react';
import Router from 'next/router';

import useRequest from '../../hooks/use-request';
import Form from '../components/form';
import { UserResponse } from './signup';

interface UserBody {
  email: string;
  password: string;
}
export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest<UserBody, UserResponse>({
    url: '/api/users/signIn',
    method: 'post',
    body: { email, password },
    onSuccess: () => Router.push('/'),
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await doRequest();
  };
  const fields = [
    {
      type: 'email',
      name: 'email',
      label: 'Email Address',
      value: email,
      onChange: ({ target: { value } }) => {
        setEmail(value);
      },
    },
    {
      type: 'password',
      name: 'password',
      label: 'Password',
      value: password,
      onChange: ({ target: { value } }) => {
        setPassword(value);
      },
    },
  ];
  return (
    <Form
      onSubmit={onSubmit}
      formName="Sign In"
      fields={fields}
      errors={errors}
    />
  );
};
