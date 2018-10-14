import _ from 'lodash'
import React, { Component } from 'react'
import styled from 'react-emotion'

import InputAddress from '../Forms/InputAddress'
import DefaultTextInput from '../Forms/TextInput'
import Label from '../Forms/Label'
import Button from '../Forms/Button'
import { H2 as DefaultH2 } from '../Typography/Basic'
import { UpdateUserProfile, LoginUser } from '../../graphql/mutations'
import { UserProfileQuery } from '../../graphql/queries'
import SafeMutation from '../SafeMutation'
import SafeQuery from '../SafeQuery'
import { GlobalConsumer } from '../../GlobalState'
import RefreshAuthToken from './RefreshAuthToken'
import { SIGN_IN } from '../../modals'
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, MARKETING_INFO } from '../../utils/legal'
import { ReactComponent as DefaultPencil } from '../svg/Pencil.svg'

const SignInContainer = styled('div')``

const FormDiv = styled('div')``

const Pencil = styled(DefaultPencil)`
  margin-right: 10px;
`

const H2 = styled(DefaultH2)`
  display: flex;
  align-items: center;
`

const Field = styled('div')`
  margin: 5px 0;
`

const Row = styled('div')`
  display: flex;
  justify-content: space-around;
  align-items: center;
`

const Column = styled('div')`
  flex: 0.5;
`


const TextInput = styled(DefaultTextInput)``

export default class SignIn extends Component {
  state = {
    name: '',
    email: '',
    twitter: ''
  }

  render() {
    return (
      <SignInContainer>
        <GlobalConsumer>
          {({ userAddress, toggleModal }) => (
            <SafeQuery
              query={UserProfileQuery}
              variables={{ address: userAddress }}
            >
              {result => {
                const hasProfile = !!_.get(result, 'data.profile.social.length')

                if (hasProfile) {
                  return this.renderSignIn(userAddress, toggleModal)
                } else {
                  return this.renderSignUp(userAddress, toggleModal)
                }
              }}
            </SafeQuery>
          )}
        </GlobalConsumer>
      </SignInContainer>
    )
  }

  renderSignUp(userAddress, toggleModal) {
    const { name, email, twitter } = this.state

    const social = [
      {
        type: 'twitter',
        value: twitter
      }
    ]

    const accepted = `${Date.now()}`
    const legal = [
      TERMS_AND_CONDITIONS,
      PRIVACY_POLICY,
      MARKETING_INFO,
    ].reduce((m, v) => {
      if (this.state[v]) {
        m.push({
          type: v,
          accepted
        })
      }
      return m
    }, [])

    return (
      <FormDiv>
        <H2>
          <Pencil />
          Create account
        </H2>
        <Label>Ethereum address</Label>
        <InputAddress address={userAddress} />
        <Field>
          <Label>Full name</Label>
          <TextInput
            placeholder="John Smith"
            value={name}
            onChange={this.handleNameChange}
          />
        </Field>
        <Field>
          <Label secondaryText="(optional)">Email</Label>
          <TextInput
            placeholder="alice@gmail.com"
            value={email}
            onChange={this.handleEmailChange}
          />
        </Field>
        <Field>
          <Label secondaryText="(optional)">Twitter</Label>
          <TextInput
            placeholder="@jack"
            value={twitter}
            onChange={this.handleTwitterChange}
          />
        </Field>
        <Field>
          <p>
            <input
              type="checkbox"
              value={TERMS_AND_CONDITIONS}
              checked={!!this.state[TERMS_AND_CONDITIONS]}
              onChange={this.handleTermsCheck}
            /> I agree with the <a href={`/terms`}>terms and conditions</a>
          </p>
          <p>
            <input
              type="checkbox"
              value={PRIVACY_POLICY}
              checked={!!this.state[PRIVACY_POLICY]}
              onChange={this.handlePrivacyCheck}
            /> I agree with the <a href={`/privacy`}>privacy policy</a>
          </p>
          <p>
            <input
              type="checkbox"
              value={MARKETING_INFO}
              checked={!!this.state[MARKETING_INFO]}
              onChange={this.handleMarketingCheck}
            /> I am happy to receive marketing info (optional)
          </p>
        </Field>
        <SafeMutation
          mutation={UpdateUserProfile}
          variables={{ profile: { email, social, legal } }}
        >
          {updateUserProfile => (
            <RefreshAuthToken>
              {refreshAuthToken => (
                <Button
                  onClick={this.signInOrSignUp({
                    refreshAuthToken,
                    fetchUserProfileFromServer: updateUserProfile,
                    toggleModal
                  })}
                >
                  Create account
                </Button>
              )}
            </RefreshAuthToken>
          )}
        </SafeMutation>
      </FormDiv>
    )
  }

  renderSignIn(userAddress, toggleModal) {
    return (
      <FormDiv>
        <H2>Sign in</H2>
        <Label>Ethereum address</Label>
        <div>{userAddress}</div>
        <SafeMutation mutation={LoginUser}>
          {loginUser => (
            <RefreshAuthToken>
              {refreshAuthToken => (
                <Button
                  onClick={this.signInOrSignUp({
                    refreshAuthToken,
                    fetchUserProfileFromServer: loginUser,
                    toggleModal
                  })}
                >
                  Sign in
                </Button>
              )}
            </RefreshAuthToken>
          )}
        </SafeMutation>
      </FormDiv>
    )
  }

  signInOrSignUp = ({
    refreshAuthToken,
    fetchUserProfileFromServer,
    toggleModal
  }) => e => {
    e.preventDefault()

    refreshAuthToken({ fetchUserProfileFromServer }).then(() =>
      toggleModal(SIGN_IN)
    )
  }

  handleEmailChange = e => {
    this.setState({
      email: e.target.value
    })
  }

  handleTwitterChange = e => {
    this.setState({
      twitter: e.target.value
    })
  }

  handleTermsCheck = e => {
    this.setState({
      [TERMS_AND_CONDITIONS]: e.target.checked
    })
  }

  handlePrivacyCheck = e => {
    this.setState({
      [PRIVACY_POLICY]: e.target.checked
    })
  }

  handleMarketingCheck = e => {
    this.setState({
      [MARKETING_INFO]: e.target.checked
    })
  }
}
