import React from 'react';
import { OidcProvider, loadUser } from 'redux-oidc';
import { compose, lifecycle } from 'recompose';
import PropTypes from 'prop-types';
import { OidcRoutes, authenticationService, getUserManager } from '@axa-fr/react-oidc-core';
import AuthenticationCallback from './AuthenticationCallback';

const propTypes = {
  notAuthenticated: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  notAuthorized: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  configuration: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  isEnabled: PropTypes.bool,
  children: PropTypes.node,
  callbackComponentOverride: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const defaultPropsObject = {
  notAuthenticated: null,
  notAuthorized: null,
  isEnabled: true,
  children: null,
  callbackComponentOverride: null,
};

const withComponentOverrideProps = (Component, customProps) => props => (
  <Component callbackComponentOverride={customProps} {...props} />
);

export const OidcBase = props => {
  const {
    isEnabled,
    children,
    store,
    callbackComponentOverride,
    configuration,
    notAuthenticated,
    notAuthorized,
  } = props;

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <OidcProvider store={store} userManager={getUserManager()}>
      <OidcRoutes
        configuration={configuration}
        notAuthenticated={notAuthenticated}
        notAuthorized={notAuthorized}
        callbackComponent={withComponentOverrideProps(
          AuthenticationCallback,
          callbackComponentOverride
        )}
      >
        {children}
      </OidcRoutes>
    </OidcProvider>
  );
};

OidcBase.propTypes = propTypes;
OidcBase.defaultProps = defaultPropsObject;

const lifecycleComponent = {
  componentWillMount() {
    const { isEnabled, store, configuration } = this.props;
    if (isEnabled) {
      const userManager = authenticationService(configuration);
      loadUser(store, userManager);
    }
  },
};

const enhance = compose(lifecycle(lifecycleComponent));

export default enhance(OidcBase);
