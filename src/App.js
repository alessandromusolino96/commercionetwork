import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Header, Segment, Statistic, Form } from 'semantic-ui-react'
const qs = require("qs");
const axios = require("axios");

class App extends Component {
  state = {
    authToken: "",
    accountNumber: "",
    walletAddress: "",
    walletCoins: [{}, {}],
    tx_recipient: "",
    tx_amount: "",
    tx_denom: ""
  };

  async componentDidMount() {
    this.getAuthToken();
    this.getWalletInformation();
    this.getBalance();
  }

  getAuthToken = async () => {
    const response = await axios({
      method: "post",
      url:
        "https://devlogin.commercio.app/auth/realms/commercio/protocol/openid-connect/token",
      data: qs.stringify({
        client_id: "dev.commercio.app",
        grant_type: "password",
        scope: "openid",
        username: "alessandromusolino@outlook.it",
        password: "aM15081996/",
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    }).then((response) => {
      localStorage.setItem("authToken", response.data.id_token);
      this.setState({
        authToken: "Bearer " + localStorage.getItem("authToken"),
      });
    });
  };

  getWalletInformation = async () => {
    const response = await axios({
      method: "get",
      url: "https://dev-api.commercio.app/v1/wallet/address",
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    }).then((response) => {
      localStorage.setItem("walletAddress", response.data.address);
      this.setState({
        accountNumber: response.data.account_number,
        walletAddress: response.data.address,
      });
    });
  };

  getBalance = async () => {
    const response = await axios({
      method: "get",
      url: "https://dev-api.commercio.app/v1/wallet/balance",
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    }).then((response) => {
      this.setState({
        walletCoins: response.data.amount
      });
    });
  };

  transfer = async (event) => {
    console.log(this.state.tx_recipient, this.state.tx_amount, this.state.tx_denom);
    event.preventDefault();
    const response = await axios({
      method: "post",
      url: "https://dev-api.commercio.app/v1/wallet/transfers",
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "content-type": "application/json",
      },
      data: {
        "amount": [
          {
            "amount": this.state.tx_amount,
            "denom": this.state.tx_denom
          }
        ],
        "back_url": "http://example.com/callback",
        "recipient": this.state.tx_recipient
      }
    }).then((response) => {
      console.log(response);
    });
  };

  render() {
    return (
      <div>
      <link
        async
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css"
      />

      <Segment clearing>
          <Header as='h2' floated='right'>
            Account Number: {this.state.accountNumber}
          </Header>
          <Header as='h2' floated='left'>
            Account Address: {this.state.walletAddress}
          </Header>
        </Segment>

        <Statistic.Group size='tiny'>
          <Statistic>
            <Statistic.Value>{this.state.walletCoins.at(0).amount}</Statistic.Value>
            <Statistic.Label>{this.state.walletCoins.at(0).denom}</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value>{this.state.walletCoins.at(1).amount}</Statistic.Value>
            <Statistic.Label>{this.state.walletCoins.at(1).denom}</Statistic.Label>
          </Statistic>
        </Statistic.Group>

        <hr />

        <Form onSubmit={this.transfer}>
          <Form.Group widths='equal'>
            <Form.Input
              fluid
              label='Recipient'
              placeholder='Address'
              value={this.state.tx_recipient}
              onChange={event => this.setState({ tx_recipient: event.target.value })}
            />
            <Form.Input
              fluid
              label='Amount'
              placeholder='Amount'
              value={this.state.tx_amount}
              onChange={event => this.setState({ tx_amount: event.target.value })}
            />
            <Form.Input
              fluid
              label='Denom'
              placeholder='uccc/ucommercio'
              value={this.state.tx_denom}
              onChange={event => this.setState({ tx_denom: event.target.value })}
            />
          </Form.Group>
          <Form.Button>Submit</Form.Button>
        </Form>

      </div>
    );
  }
}

export default App;
