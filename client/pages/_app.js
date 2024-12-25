// We can only Include some global css into our Next project inside this _app file.
// This global css will be included on every single page.
import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client"; //
import Header from "../components/header";

// Behind the scenes, whenever we try to navigate to a page (index or banana) with Next,
// Next imports the Component from one of the files inside pages directory (index or banana).
// Next doesn't just take the component and show it on the screen,
// it wraps it up inside of its own custom component, referred to (_app)
// IMPORTANT: By defining _app.js, we are defining our own Next custom app component!!!!
// Next will grab whatever component (inside of index or banana) from the path and pass it inside the Component prop
// and pageProps are going to be the set of components that we intend to pass (Landing)
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

// Nextjs uses this function during server side rendering process
// When the app component renders itself with the current user,
// take the current user and pass it as a prop to the child component
// this will make sure every child component inside of our application (pages directory)
// will always receive the current user as a prop
AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  // fetch the current user
  const { data } = await client.get("/api/users/currentuser");

  // IMPORTANT: We invoke every child component's getInitialProps HERE
  // So we pass the (buildClient) client that already built inside the getInitialProps
  // as well as the currentUser that we already fetched
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return { pageProps, ...data };
};

export default AppComponent;
