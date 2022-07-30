import React from 'react';
import { Header, Segment } from 'semantic-ui-react';

const PageHeader = (props) => {
  const accountNumber = props.accountNumber;
  const walletAddress = props.walletAddress;
  console.log("ciao");
  return (
    <Segment clearing>
      <Header as='h2' floated='right'>
        Account Number: {accountNumber}
      </Header>
      <Header as='h2' floated='left'>
        Account Address: {walletAddress}
      </Header>
    </Segment>
  );
};

export default PageHeader;
