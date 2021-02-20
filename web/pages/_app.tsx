import 'bootstrap/dist/css/bootstrap.css';
import type { AppProps, AppContext } from 'next/app';
import { buildClient } from '../api/buildClient';
import { UserResponse } from './auth/signup';
import Header from './components/header';

interface IAppProps extends AppProps {
  currentUser: UserResponse;
}

export const AppComponent = ({
  Component,
  pageProps,
  currentUser,
}: IAppProps) => {
  return (
    <>
      <Header currentUser={currentUser}>Header</Header>
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </>
  );
};

AppComponent.getInitialProps = async (appContext: AppContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentUser');
  let pageProps = {};
  if (appContext.Component.getInitialProps)
    pageProps = await (appContext.Component as any).getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  return { pageProps, ...data };
};

export default AppComponent;
