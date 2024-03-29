import React from 'react';
import { DepositStore } from '../../models/deposit';
import { DepositStatus } from '../../models/deposit';
import { observer } from 'mobx-react';
import './deposits.scss';
import DepositForm from '../../components/deposit-form';
import DepositListItem from '../../dummies/deposit-list-item';
import Button from '../../dummies/button';
import { ContextStore } from '../../models/context';
import { ProjectStore } from '../../models/project';

interface DepositsProps {
  depositStore: DepositStore;
  contextStore: ContextStore;
  projectStore: ProjectStore;
}

interface DepositsState {
  filters: any;
}

@observer
export default class Deposits extends React.Component<DepositsProps, DepositsState> {
  constructor(props) {
    super(props);

    this.state = { filters: { hide: false } };
  }

  onChangeStatus = (event: any, id: string) => {
    const depositIndex = this.props.depositStore.deposits.findIndex((d) => d.id === id);
    this.props.depositStore.changeDeposit(depositIndex, {value: '', status: this.props.depositStore.deposits[depositIndex].status === DepositStatus.unprocessed ? DepositStatus.actedUpon : DepositStatus.unprocessed});
  }

  changeShown = () => {
    this.setState(state => ({ filters: {hide: !state.filters.hide} }));
  }

  onClear = (event?: any) => {
    this.props.depositStore.setDeposits(null);
  }

  render() {
    const deposits = this.props.depositStore.chronological.map((d) => {
      if(!this.state.filters.hide) {
        if(d.status===DepositStatus.unprocessed) {
          return (<DepositListItem key={d.id} depositId={d.id} value={d.value} status={d.status !== DepositStatus.unprocessed} date={d.dateAdded} changeStatus={this.onChangeStatus} context={this.props.contextStore.findById(d.contextId)} project={this.props.projectStore.findById(d.projectId)} />)
        } else {
          return null;
        }
      } else {
        return (<DepositListItem key={d.id} depositId={d.id} value={d.value} status={d.status !== DepositStatus.unprocessed} date={d.dateAdded} changeStatus={this.onChangeStatus} context={this.props.contextStore.findById(d.contextId)} project={this.props.projectStore.findById(d.projectId)} />)
      }
    }) as any;

    return (
      <div className="Deposits">
        <DepositForm store={this.props.depositStore} context={this.props.contextStore} project={this.props.projectStore} />
        <div className="deposit-list">
          { deposits }
        </div>
        <Button style={{padding: '0.5rem', marginRight: '0.4rem'}} onClick={this.onClear}>Clear Deposits</Button>
        <Button style={{padding: '0.5rem'}} onClick={this.changeShown}>{ this.state.filters.hide ? 'Hide Finished' : 'Show Finished' }</Button>
      </div>
    );
  }
}
