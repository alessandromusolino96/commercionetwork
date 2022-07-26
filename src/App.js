import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Header, Segment, Statistic, Form, Message } from 'semantic-ui-react';
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
    tx_denom: "",
    message: "",
    notes: "",
  };

  async componentDidMount() {
    this.getAuthToken();
    this.getWalletInformation();
    this.getBalance();
    this.getSignedDocuments();
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
      console.log(response.data.id_token);
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
    // console.log(this.state.tx_recipient, this.state.tx_amount, this.state.tx_denom);
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
      // console.log(response);
      this.setState({
        message: "Correctly sent " + response.data.amount.at(0).amount + " " + response.data.amount.at(0).denom + " to " + response.data.receiver + ". The sender token id is: " + response.data.send_token_id
      });
    });
  };

  signDocument = async (event) => {
    event.preventDefault();
    var bodyFormData = new FormData();
    var pdfFile = document.querySelector('#document');
    bodyFormData.append("document", pdfFile.files[0]);
    bodyFormData.append("note", this.state.notes);
    const response = await axios({
      method: "post",
      url: "https://dev-api.commercio.app/v1/sign/process",
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "content-type": "multipart/form-data",
      },
      data: bodyFormData,
    }).then((response) => {
      // console.log(response);
    });
  };

  getSignedDocuments = async () => {
    const response = await axios({
      method: "get",
      url: "https://dev-api.commercio.app/v1/sign/process",
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    }).then((response) => {
      console.log(response);
      var tbody = document.querySelector('#signed-documents');
      var list = response.data.list;
      list.forEach(signedDocument => {
        // console.log(signedDocument.id);
        var tr = document.createElement('tr');
        var td_id = document.createElement('td');
        var td_note = document.createElement('td');
        var td_original_document_hash = document.createElement('td');
        var td_original_name = document.createElement('td');
        var td_owner_username = document.createElement('td');
        var td_signed_document_hash = document.createElement('td');
        var td_signer_username = document.createElement('td');
        var td_signature_time = document.createElement('td');
        var td_status = document.createElement('td');
        var td_tx_process_id = document.createElement('td');
        td_id.innerHTML = signedDocument.id;
        td_note.innerHTML = signedDocument.note;
        td_original_document_hash.innerHTML = signedDocument.original_document.hash;
        td_original_name.innerHTML = signedDocument.original_document.original_name;
        td_owner_username.innerHTML = signedDocument.owner_username;
        td_signed_document_hash.innerHTML = signedDocument.signed_document.hash;
        td_signer_username.innerHTML = signedDocument.signer_username;
        td_signature_time.innerHTML = signedDocument.sign_end_at;
        td_status.innerHTML = signedDocument.status;
        td_tx_process_id.innerHTML = signedDocument.tx_process_id;
        tr.appendChild(td_id);
        tr.appendChild(td_note);
        tr.appendChild(td_original_document_hash);
        tr.appendChild(td_original_name);
        tr.appendChild(td_owner_username);
        tr.appendChild(td_signed_document_hash);
        tr.appendChild(td_signer_username);
        tr.appendChild(td_signature_time);
        tr.appendChild(td_status);
        tr.appendChild(td_tx_process_id);
        tbody.appendChild(tr);
      });
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

        <h1>
          Transfer money
        </h1>

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

        <Message>
          <Message.Header>Message status</Message.Header>
          <p>
            {this.state.message}
          </p>
        </Message>

        <hr />
        <br />

        <div>
          <h1>Sign a document</h1>

          <Form onSubmit={this.signDocument}>
            <Form.Group widths='equal'>
              <input type="file" name="document" id="document" accept="application/pdf" />
              <Form.Input
                fluid
                label='note'
                placeholder='note'
                value={this.state.notes}
                onChange={event => this.setState({ notes: event.target.value })}
              />
            </Form.Group>
            <Form.Button>Submit</Form.Button>
          </Form>
        </div>

        <br />

        <div>
          <h1>Signed Documents</h1>
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Note</th>
                <th>Original document hash</th>
                <th>Original name</th>
                <th>Owner username</th>
                <th>Signed document hash</th>
                <th>Signer username</th>
                <th>Signature time</th>
                <th>Status</th>
                <th>Tx process id</th>
              </tr>
            </thead>
            <tbody id="signed-documents" />
          </table>
        </div>

      </div>
    );
  }
}

export default App;
